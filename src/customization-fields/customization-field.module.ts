import { Module } from '@nestjs/common';
import { CustomizationFieldService } from './customization-field.service';
import { CustomizationFieldController } from './customization-field.controller';
import { CustomizationFieldRepository } from './customization-field.repository';

@Module({
  controllers: [CustomizationFieldController],
  providers: [CustomizationFieldService, CustomizationFieldRepository],
  exports: [CustomizationFieldService],
})
export class CustomizationFieldModule {}
