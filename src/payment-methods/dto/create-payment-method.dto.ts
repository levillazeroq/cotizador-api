import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator'

export enum PaymentMethodType {
  WEBPAY = 'webpay',
  TRANSFER = 'transfer',
  CHECK = 'check',
}

export class CreatePaymentMethodDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @IsEnum(PaymentMethodType)
  type: PaymentMethodType

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  displayName: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  icon: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  requiresProof?: boolean

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}
