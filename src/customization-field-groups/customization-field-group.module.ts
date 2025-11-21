import { Module } from '@nestjs/common';
import { CustomizationFieldGroupService } from './customization-field-group.service';
import { CustomizationFieldGroupController } from './customization-field-group.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomizationFieldGroupController],
  providers: [CustomizationFieldGroupService],
  exports: [CustomizationFieldGroupService],
})
export class CustomizationFieldGroupModule {}

