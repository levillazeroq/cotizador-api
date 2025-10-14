import { IsString, IsNumber, IsOptional, IsPositive, Min } from 'class-validator'

export class CreateCartItemDto {
  @IsString()
  productId: string

  @IsString()
  name: string

  @IsString()
  sku: string

  @IsOptional()
  @IsString()
  size?: string

  @IsOptional()
  @IsString()
  color?: string

  @IsNumber()
  @IsPositive()
  price: number

  @IsNumber()
  @Min(1)
  quantity: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsNumber()
  @IsPositive()
  maxStock: number
}
