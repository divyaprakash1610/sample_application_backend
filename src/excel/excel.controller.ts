import { Controller, Get, Param } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('export/:projectName')
  async export(@Param('projectName') projectName: string) {
    return this.excelService.exportProjectToExcel(projectName);
  }
}
