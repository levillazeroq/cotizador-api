import { PartialType } from '@nestjs/mapped-types'
import { CreateCustomizationGroupDto } from './create-customization-group.dto'

export class UpdateCustomizationGroupDto extends PartialType(CreateCustomizationGroupDto) {}
