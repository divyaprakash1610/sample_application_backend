import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/projects.schema';
import { Part, PartSchema } from './schemas/part.schema';
import { MachineError, MachineErrorSchema } from './schemas/machine-error.schema';
import { Log, LogSchema } from './schemas/log.schema';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';
import { PartError, PartErrorSchema } from './schemas/error.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Part.name, schema: PartSchema },
      { name: MachineError.name, schema: MachineErrorSchema },   // <-- added
      { name: Log.name, schema: LogSchema },     // <-- added
      { name: PartError.name, schema: PartErrorSchema }, // <-- added
    ]),
    MailModule,
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
