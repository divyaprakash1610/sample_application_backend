// import { Controller, Post, Body } from '@nestjs/common';
// import { GoogleDriveService } from './google-drive.service';

// @Controller('drive')
// export class GoogleDriveController {
//   constructor(private readonly driveService: GoogleDriveService) {}

//   @Post('upload')
//   async uploadFile(@Body('filePath') filePath: string) {
//     try {
//       const result = await this.driveService.uploadFile(filePath);
//       return { success: true, data: result };
//     } catch (err) {
//       return { success: false, error: err.message };
//     }
//   }
// }
