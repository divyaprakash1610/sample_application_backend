import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';

// Import your schemas
import { Project, ProjectSchema } from '../projects/schemas/projects.schema';
import { Log, LogSchema } from '../projects/schemas/log.schema';
import { PartError, PartErrorSchema } from '../projects/schemas/error.schema';
import { MachineError, MachineErrorSchema } from '../projects/schemas/machine-error.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Log.name, schema: LogSchema },
      { name: PartError.name, schema: PartErrorSchema },
      { name: MachineError.name, schema: MachineErrorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
