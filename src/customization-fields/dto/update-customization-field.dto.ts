import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomizationFieldDto } from './create-customization-field.dto';

/**
 * DTO para actualizar campos de personalización
 * Todos los campos son opcionales (heredados de CreateCustomizationFieldDto)
 */
export class UpdateCustomizationFieldDto extends PartialType(CreateCustomizationFieldDto) {}
