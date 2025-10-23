// import { Injectable } from '@nestjs/common';
// import { google } from 'googleapis';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class GoogleDriveService {
//   private drive;

//   constructor() {
//     const CONFIG_PATH = path.join(process.cwd(), 'src', 'config', 'client_secret.json');
// if (!fs.existsSync(CONFIG_PATH)) throw new Error('Config file not found: ' + CONFIG_PATH);

//     const credentials = require(CONFIG_PATH);
//     const tokens = require('../../config/.tokens.json');

//     const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

//     const oAuth2Client = new google.auth.OAuth2(
//       client_id,
//       client_secret,
//       redirect_uris[0]
//     );

//     oAuth2Client.setCredentials(tokens);

//     this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
//   }

//   async uploadFile(filePath: string, mimeType: string = 'application/octet-stream') {
//     if (!fs.existsSync(filePath)) throw new Error('File does not exist: ' + filePath);

//     const fileName = path.basename(filePath);

//     const response = await this.drive.files.create({
//       requestBody: {
//         name: fileName,
//       },
//       media: {
//         mimeType,
//         body: fs.createReadStream(filePath),
//       },
//       fields: 'id, name, webViewLink',
//     });

//     return response.data;
//   }
// }
