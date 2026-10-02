import { ArrayUnique, IsArray, IsInt, IsUUID, Min } from "class-validator";

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsArray()
  @IsUUID("all", { each: true })
  @ArrayUnique()
  toppingIds: string[];
}

export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
