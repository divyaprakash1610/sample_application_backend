import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as nodemailer from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/projects.schema';
import { Part } from './schemas/part.schema';
import { Log, LogDocument } from './schemas/log.schema';
import { MachineError, MachineErrorDocument } from './schemas/machine-error.schema';
import { PartError,PartErrorDocument } from './schemas/error.schema';

@Injectable()
export class ProjectsService {
  public baseDir = path.resolve(__dirname, '..', '..', 'projects');

  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Part.name) private partModel: Model<Part>,
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
    @InjectModel(MachineError.name) private machineErrorModel: Model<MachineErrorDocument>,
    @InjectModel(PartError.name)private readonly partErrorModel: Model<PartErrorDocument>,
  ) {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /** ---------------- CREATE PROJECT ---------------- */
  async createProject(projectName: string, user: any) {
  const existing = await this.projectModel.findOne({ name: projectName, createdBy: user.employeeId });
  if (existing) throw new ConflictException(`Project "${projectName}" already exists`);

  const project = await this.projectModel.create({
    name: projectName,
    createdBy: user.employeeId,
    userId: user._id,
    metadata: { createdAt: new Date().toISOString(), createdByempId: user.employeeId, createdByName: user.firstName },
  });
  return { message: 'Project created successfully', project };
}


  /** ---------------- ADD PART ---------------- */
  async addPart(projectName: string, partName: string, user: any) {
    console.log("Adding part ", partName, " to project ", projectName, " for user ", user);
    const project = await this.projectModel.findOne({ name: projectName, createdBy: user.employeeId });
    if (!project) throw new NotFoundException(`Project not found`);

    const existingPart = await this.partModel.findOne({ projectName, name: partName });
    if (existingPart) throw new ConflictException(`Part "${partName}" already exists`);

    const part = await this.partModel.create({ projectName, name: partName, createdBy: user.employeeId, metadata: {} });

    return { message: `Part ${partName} added successfully`, part };
  }

  /** ---------------- GET PARTS ---------------- */
  async getParts(projectName: string) {
    const parts = await this.partModel.find({ projectName });
    return parts.map((p) => p.name);
  }

   /** ---------------- ADD STEP ---------------- */
  async addStep(
  projectName: string,
  partName: string,
  stepName: string,
  status: string,
  user: any,
) {
  const project = await this.projectModel.findOne({ name: projectName });
  if (!project) throw new NotFoundException(`Project not found`);

  const part = await this.partModel.findOne({ projectName, name: partName });
  if (!part) throw new NotFoundException(`Part "${partName}" not found`);

  // ✅ Check if step already exists
  const existingLog = await this.logModel.findOne({ partName: part.name, stepName });

  if (existingLog) {
    existingLog.status = status || existingLog.status;
    existingLog.metadata = {
      ...existingLog.metadata,
      updatedAt: new Date().toISOString(),
    };
    await existingLog.save();

    // 🧩 If status changed to SUCCESS → mark machine recovery
    if (status.trim()=== 'Validation passed') {
      console.log("status is validation passed");
      await this.handleMachineRecovery(projectName, partName, stepName, user);
    }

    return { message: `Step "${stepName}" updated to ${status}`, log: existingLog };
  }

  // 🆕 Otherwise create a new step log
  const log = await this.logModel.create({
    projectName,
    partName: part.name,
    stepName,
    createdBy: user.employeeId,
    status: status || 'PENDING',
    metadata: { loggedAt: new Date().toISOString() },
  });

  // 🧩 If new step is marked VALIDATION PASSED immediately
  if ((status || '').toUpperCase() === 'VALIDATION PASSED') {
    console.log("status is validation passed");
    await this.handleMachineRecovery(projectName, partName, stepName, user);
  }
  console.log("log:recovery called");
  return { message: `Step "${stepName}" added to part ${partName}`, log };
}

private async handleMachineRecovery(
  projectName: string,
  partName: string,
  stepName: string,
  user: any,
) {
  const machineError = await this.machineErrorModel.findOne({
    projectName,
    partName,
  });
  console.log("Checking machine error for recovery:", { projectName, partName, stepName });
  if (!machineError) {
    console.log("no error")
    return; // no matching active error
  }
  const recoveredAt = new Date();
  const recoveryDurationMs =
    recoveredAt.getTime() - new Date(machineError.loggedAt).getTime();
  const recoveryDurationHours = Math.round(recoveryDurationMs / (1000 * 60 * 60));

  machineError.recoveredAt = recoveredAt;
  machineError.recoveryDuration = recoveryDurationHours;

  await machineError.save();
  console.log(
    `✅ Machine recovered for step "${stepName}" (${recoveryDurationHours} hours)`
  );
}


 async getSteps(projectName: string, partName: string) {
  const part = await this.partModel.findOne({ projectName, name: partName });
  if (!part) throw new NotFoundException(`Part "${partName}" not found`);

  // ✅ Fetch only logs related to this part
  const logs = await this.logModel.find({ partName }).sort({ createdAt: 1 });

  // Return a clean structure (steps only)
  if (!logs) return [];
  return logs.map((l) => ({
    name: l.stepName,
    status: l.status,
    createdBy: l.createdBy,
    timestamp: l.createdAt,
  }));
}


  /** ---------------- LOG MACHINE ERROR ---------------- */
  async addMachineError(
    projectName: string,
    partName: string,
    machineName: string,
    errorMessage: string,
    user: any,
  ) {
    const machineError = await this.machineErrorModel.create({
      projectName,
      partName,
      machineName,
      errorMessage,
      loggedBy: user.employeeId,
      loggedAt: new Date(),
      recoveredAt: null,
    });
    return { message: `Machine error logged`, machineError };
  }

  
  /** ---------------- GET ALL PROJECTS ---------------- */
  async getAllProjects() {
    const projects = await this.projectModel.find().sort({ createdAt: -1 }); // No user filter
    console.log("all projects: ", projects);
    return projects.map((p) => ({
      id: p._id,
      name: p.name,
      createdBy: p.createdBy,
      createdAt: p.metadata?.createdAt
    }));
  }
  
  async logError(
    projectName: string,
    partName: string,
    stepName: string,
    errorMessage: string,
    user: any,
  ): Promise<PartError> {
    const errorEntry = new this.partErrorModel({
      projectName,
      partName,
      stepName,
      errorMessage,
      loggedAt: new Date(),
      loggedBy: user.employeeId,
    });

    return await errorEntry.save();
  }
  

  /** ---------------- DELETE PROJECT ---------------- */
async deleteProject(projectName: string, user: any) {
  const project = await this.projectModel.findOneAndDelete({
    name: projectName,
    createdBy: user.employeeId,
  });

  if (!project) throw new NotFoundException(`Project "${projectName}" not found`);

  // Delete all parts, logs, and errors under this project
  await this.partModel.deleteMany({ projectName });
  await this.logModel.deleteMany({ projectName });
  await this.machineErrorModel.deleteMany({ projectName });
  await this.partErrorModel.deleteMany({ projectName });

  // Delete from filesystem if exists
  const projectPath = path.join(this.baseDir, projectName);
  if (fs.existsSync(projectPath)) fs.rmSync(projectPath, { recursive: true, force: true });

  return { message: `Project "${projectName}" and its related data deleted successfully` };
}
/** ---------------- DELETE PART ---------------- */
async deletePart(projectName: string, partName: string, user: any) {
  const part = await this.partModel.findOneAndDelete({ projectName, name: partName });
  if (!part) throw new NotFoundException(`Part "${partName}" not found in project "${projectName}"`);

  // Delete logs, errors related to this part
  await this.logModel.deleteMany({ projectName, partName });
  await this.machineErrorModel.deleteMany({ projectName, partName });
  await this.partErrorModel.deleteMany({ projectName, partName });

  return { message: `Part "${partName}" and its related data deleted successfully` };
}
/** ---------------- DELETE STEP ---------------- */
async deleteStep(projectName: string, partName: string, stepName: string) {
  const log = await this.logModel.findOneAndDelete({ projectName, partName, stepName });
  if (!log) throw new NotFoundException(`Step "${stepName}" not found in part "${partName}"`);

  // Optional: also remove part-specific errors for this step
  await this.partErrorModel.deleteMany({ projectName, partName, stepName });

  return { message: `Step "${stepName}" deleted successfully from part "${partName}"` };
}
}
