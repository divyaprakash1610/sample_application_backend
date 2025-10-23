import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { Project } from '../projects/schemas/projects.schema';
import { Log } from '../projects/schemas/log.schema';
import { PartError } from '../projects/schemas/error.schema';
import { MachineError } from '../projects/schemas/machine-error.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { google } from 'googleapis';

@Injectable()
export class ExcelService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectModel(PartError.name) private partErrorModel: Model<PartError>,
    @InjectModel(MachineError.name) private machineErrorModel: Model<MachineError>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async exportProjectToExcel(projectName: string): Promise<{ filePath: string; driveLink?: string }> {
    const project = await this.projectModel.findOne({ name: projectName });
    if (!project) throw new NotFoundException(`Project not found`);

    const logs = await this.logModel.find({ projectName: project.name });
    const partErrors = await this.partErrorModel.find({ projectName: project.name });
    const machineErrors = await this.machineErrorModel.find({ projectName: project.name });

    const workbook = new ExcelJS.Workbook();

    /** 🧾 1️⃣ Each part’s log = separate sheet */
    const groupedLogs = logs.reduce<Record<string, any[]>>((acc, log) => {
      acc[log.partName] = acc[log.partName] || [];
      acc[log.partName].push(log);
      return acc;
    }, {});

    for (const [partName, partLogs] of Object.entries(groupedLogs)) {
      const sheet = workbook.addWorksheet(`${partName}_Logs`);
      sheet.columns = [
        { header: 'Step Name', key: 'stepName', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created By', key: 'createdBy', width: 20 },
        { header: 'Created At', key: 'createdAt', width: 25 },
        { header: 'Metadata', key: 'metadata', width: 30 },
      ];

      partLogs.forEach((log: any) => {
        sheet.addRow({
          stepName: log.stepName,
          status: log.status,
          createdBy: log.createdBy,
          createdAt: log.createdAt,
          metadata: JSON.stringify(log.metadata || {}),
        });
      });
    }

    /** ⚙️ 2️⃣ Add part errors sheet */
    const partErrorSheet = workbook.addWorksheet('Part_Errors');
    partErrorSheet.columns = [
      { header: 'Part Name', key: 'partName', width: 25 },
      { header: 'Error Message', key: 'errorMessage', width: 35 },
      { header: 'Logged By', key: 'loggedBy', width: 25 },
      { header: 'Logged At', key: 'loggedAt', width: 25 },
      { header: 'Metadata', key: 'metadata', width: 30 },
    ];
    partErrors.forEach((err) => {
      partErrorSheet.addRow({
        partName: err.partName,
        errorMessage: err.errorMessage,
        loggedBy: err.loggedBy,
        loggedAt: err.loggedAt,
        metadata: JSON.stringify(err.metadata || {}),
      });
    });

    /** 🧰 3️⃣ Add machine errors sheet */
    const machineErrorSheet = workbook.addWorksheet('Machine_Errors');
    machineErrorSheet.columns = [
      { header: 'Machine Name', key: 'machineName', width: 25 },
      { header: 'Part Name', key: 'partName', width: 25 },
      { header: 'Error Message', key: 'errorMessage', width: 35 },
      { header: 'Logged At', key: 'loggedAt', width: 25 },
      { header: 'Recovered At', key: 'recoveredAt', width: 25 },
      { header: 'Recovery Duration', key: 'recoveryDuration', width: 25 },
      { header: 'Metadata', key: 'metadata', width: 30 },
    ];
    machineErrors.forEach((err) => {
      machineErrorSheet.addRow({
        machineName: err.machineName,
        partName: err.partName,
        errorMessage: err.errorMessage,
        loggedAt: err.loggedAt,
        recoveredAt: err.recoveredAt,
        recoveryDuration: err.recoveryDuration,
      });
    });

    /** 📂 4️⃣ Save Excel file locally */
    const dir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const filePath = path.join(dir, `${project.name}_Report.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    /** ☁️ 5️⃣ Upload to Google Drive */
   // Fetch the saved access token from MongoDB
const tokenRecord = await this.userModel.findOne({ email: 'divyaprakash1610@gmail.com' });
console.log("token record: ", tokenRecord);
if (!tokenRecord || !tokenRecord.accessToken) throw new Error('No access token found for the account');

const result = await this.uploadToDrive(filePath, projectName, tokenRecord.accessToken);

    return { filePath, driveLink: result.fileLink ?? undefined };
  }

  /** ---------------- UPLOAD TO GOOGLE DRIVE ---------------- */
  async uploadToDrive(filePath: string, projectName: string, accessToken: string) {
  const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!FOLDER_ID) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID is not set in environment variables.');
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });
  const fileName = `${projectName}_Report.xlsx`;

  // 1️⃣ Search if file already exists in the folder
  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const existingFile = res.data.files?.[0];

  const media = {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: fs.createReadStream(filePath),
  };

  let response;

  if (existingFile) {
    // 2️⃣ Update existing file
    response = await drive.files.update({
      fileId: existingFile.id!,
      media,
      fields: 'id, webViewLink',
    });
    console.log('🔄 Replaced existing file on Drive:', response.data.webViewLink);
  } else {
    // 3️⃣ Create new file
    response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [FOLDER_ID],
      },
      media,
      fields: 'id, webViewLink',
    });
    console.log('✅ Uploaded new file to Drive:', response.data.webViewLink);
  }

  return {
    fileId: response.data.id,
    fileLink: response.data.webViewLink,
  };
}

}
