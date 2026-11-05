import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ProductCategory } from "../generated/prisma";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class CreateProductDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Vui lòng nhập tên món" })
  @MaxLength(100)
  name: string;

  @IsInt({ message: "Giá phải là số nguyên (đồng)" })
  @Min(0)
  @Max(10_000_000)
  price: number;

  @IsEnum(ProductCategory, { message: "Danh mục không hợp lệ" })
  category: ProductCategory;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Tên món không được để trống" })
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsInt({ message: "Giá phải là số nguyên (đồng)" })
  @Min(0)
  @Max(10_000_000)
  price?: number;

  @IsOptional()
  @IsEnum(ProductCategory, { message: "Danh mục không hợp lệ" })
  category?: ProductCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
