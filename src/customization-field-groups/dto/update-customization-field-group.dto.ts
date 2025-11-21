import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomizationFieldGroupDto } from './create-customization-field-group.dto';

export class UpdateCustomizationFieldGroupDto extends PartialType(CreateCustomizationFieldGroupDto) {}

