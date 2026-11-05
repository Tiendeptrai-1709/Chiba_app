import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ProductCategory } from "../generated/prisma";

const MAX_STOCK = 100_000;

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

  @IsEnum(ProductCategory, { message: "Loại món không hợp lệ" })
  category: ProductCategory;

  @IsOptional()
  @IsInt({ message: "Số lượng phải là số nguyên" })
  @Min(0)
  @Max(MAX_STOCK)
  stock?: number;

  // Danh mục (Cà phê, Trà sữa...). null = bỏ khỏi danh mục.
  @IsOptional()
  @IsString({ message: "Danh mục không hợp lệ" })
  groupId?: string | null;
}

export class SetStockDto {
  @IsInt({ message: "Số lượng phải là số nguyên" })
  @Min(0, { message: "Số lượng không được âm" })
  @Max(MAX_STOCK, { message: `Số lượng tối đa ${MAX_STOCK}` })
  stock: number;
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
  @IsEnum(ProductCategory, { message: "Loại món không hợp lệ" })
  category?: ProductCategory;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  // Danh mục (Cà phê, Trà sữa...). null = bỏ khỏi danh mục.
  @IsOptional()
  @IsString({ message: "Danh mục không hợp lệ" })
  groupId?: string | null;
}

export class MenuGroupDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Vui lòng nhập tên danh mục" })
  @MaxLength(50, { message: "Tên danh mục tối đa 50 ký tự" })
  name: string;
}

export class ReorderMenuGroupsDto {
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids: string[];
}

export class MenuStatsQueryDto {
  // Ngày theo giờ Việt Nam, dạng YYYY-MM-DD (tính cả hai đầu)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày bắt đầu không hợp lệ" })
  from: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày kết thúc không hợp lệ" })
  to: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}
