import { Module } from '@nestjs/common'
import { CustomizationGroupController } from './customization-group.controller'
import { CustomizationGroupService } from './customization-group.service'
import { CustomizationGroupRepository } from './customization-group.repository'

@Module({
  controllers: [CustomizationGroupController],
  providers: [CustomizationGroupService, CustomizationGroupRepository],
  exports: [CustomizationGroupService, CustomizationGroupRepository],
})
export class CustomizationGroupModule {}
