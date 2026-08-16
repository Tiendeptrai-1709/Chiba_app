import { IsNumber, IsString } from "class-validator";
import { ProductCategory } from "src/generated/prisma";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  imageUrl: string;

  category?: ProductCategory;
}