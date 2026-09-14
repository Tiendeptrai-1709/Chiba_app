import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { ProductCategory } from "src/generated/prisma";

export class CreateProductDto {
  @IsString()
  name: string;

  @Type(() =>Number)
  @IsNumber()
  price: number;

  category?: ProductCategory;
}