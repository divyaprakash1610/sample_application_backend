import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  Res,
  Req,
  NotFoundException,
  HttpStatus 
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MailService } from '../mail/mail.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService, private readonly mailService: MailService) {}

  /** ---------------- CREATE PROJECT ---------------- */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createProject(@Body('name') name: string, @Req() req: any) {
    return this.projectsService.createProject(name, req.user);
  }

  /** ---------------- ADD PART ---------------- */
  @UseGuards(JwtAuthGuard)
  @Post('parts/add')
  async addPart(
    @Body('projectName') projectName: string,
    @Body('partName') partName: string,
    @Req() req: any,
  ) {
    return this.projectsService.addPart(projectName, partName, req.user);
  }


  /** ---------------- GET PARTS ---------------- */
  @Get(':projectName/parts')
  async getParts(@Param('projectName') projectName: string) {
    return this.projectsService.getParts(projectName);
  }

  /** ---------------- ADD STEP ---------------- */
  @UseGuards(JwtAuthGuard)
  @Post(':projectName/parts/:partName/steps/add')
  async addStep(
    @Param('projectName') projectName: string,
    @Param('partName') partName: string,
    @Body('stepName') stepName: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    console.log("status: ", status);
    return this.projectsService.addStep(projectName, partName, stepName, status, req.user);
  }

  /** ---------------- GET STEPS ---------------- */
  @Get(':projectName/parts/:partName/steps')
  async getSteps(@Param('projectName') projectName: string, @Param('partName') partName: string) {
    return this.projectsService.getSteps(projectName, partName);
  }

  /** ---------------- LOG MACHINE ERROR ---------------- */
  @UseGuards(JwtAuthGuard)
  @Post(':projectName/:partName/machine-error/add')
  async addMachineError(
    @Param('projectName') projectName: string,
    @Param('partName') partName: string,
    @Body('machineName') machineName: string,
    @Body('errorMessage') errorMessage: string,
    @Req() req: any,
  ) {
    return this.projectsService.addMachineError(projectName, partName, machineName, errorMessage, req.user);
  }


  /** ---------------- GET ALL PROJECTS ---------------- */
  @Get()
  async getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  /** ---------------- LOG PART ERROR ---------------- */
  @UseGuards(JwtAuthGuard)
  @Post(':projectName/parts/:partName/error/log')
  async logPartError(
    @Param('projectName') projectName: string,
    @Param('partName') partName: string,
    @Body('stepName') stepName: string,
    @Body('errorMessage') errorMessage: string,
    @Req() req: any,
  ) {
    return this.projectsService.logError(projectName, partName, stepName, errorMessage, req.user);
  }
  /** ---------------- SEND ERROR EMAIL ---------------- */
  @UseGuards(JwtAuthGuard)
  @Post('send-error')
  async sendErrorEmail(
    @Body('adminEmail') adminEmail: string,
    @Body('partName') partName: string,
    @Body('stepName') stepName: string,
    @Body('projectName') projectName: string,
    @Body('errorDetails') errorDetails: string,
    @Res() res: Response,
  ) {
    console.log("Sending error email to:", adminEmail);
    try {
      const result = await this.mailService.sendErrorEmail(adminEmail, partName, projectName, stepName, errorDetails);
      console.log("Email sent successfully:", result);
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      console.error("Error sending email:", error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Failed to send email' });
    }
  }
  
  // ✅ ---------------- DELETE PROJECT ----------------
  @UseGuards(JwtAuthGuard)
  @Delete(':projectName')
  async deleteProject(@Param('projectName') projectName: string, @Req() req: any) {
    return this.projectsService.deleteProject(projectName, req.user);
  }

  // ✅ ---------------- DELETE PART ----------------
  @UseGuards(JwtAuthGuard)
  @Delete(':projectName/parts/:partName')
  async deletePart(
    @Param('projectName') projectName: string,
    @Param('partName') partName: string,
    @Req() req: any,
  ) {
    return this.projectsService.deletePart(projectName, partName, req.user);
  }

  // ✅ ---------------- DELETE STEP ----------------
  @UseGuards(JwtAuthGuard)
  @Delete(':projectName/parts/:partName/steps/:stepName')
  async deleteStep(
    @Param('projectName') projectName: string,
    @Param('partName') partName: string,
    @Param('stepName') stepName: string,
  ) {
    return this.projectsService.deleteStep(projectName, partName, stepName);
  }
}



