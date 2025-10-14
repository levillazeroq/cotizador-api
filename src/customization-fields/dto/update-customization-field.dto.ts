import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomizationFieldDto } from './create-customization-field.dto';

export class UpdateCustomizationFieldDto extends PartialType(CreateCustomizationFieldDto) {}
