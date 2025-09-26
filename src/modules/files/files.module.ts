import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesTestController } from './files-test.controller';
import { FilesTestSecureController } from './files-test-secure.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([File]), CommonModule],
  controllers: [FilesController, FilesTestController, FilesTestSecureController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
