import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
  IsNotEmpty,
} from "class-validator";
import { OrderStatus, OrderType, PaymentMethod } from "../generated/prisma";

export const SUGAR_LEVELS = [0, 30, 50, 70, 100] as const;
export const ICE_LEVELS = ["NONE", "LESS", "NORMAL", "SEPARATE"] as const;
export type SugarLevel = (typeof SUGAR_LEVELS)[number];
export type IceLevel = (typeof ICE_LEVELS)[number];

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  toppingIds?: string[];

  // Chỉ áp dụng cho đồ uống
  @IsOptional()
  @IsIn(SUGAR_LEVELS as unknown as number[], { message: "Độ ngọt không hợp lệ" })
  sugar?: SugarLevel;

  @IsOptional()
  @IsIn(ICE_LEVELS as unknown as string[], { message: "Mức đá không hợp lệ" })
  ice?: IceLevel;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: "Giỏ hàng trống" })
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsEnum(OrderType)
  orderType: OrderType;

  @ValidateIf((o: CreateOrderDto) => o.orderType === OrderType.DELIVERY)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "Vui lòng nhập địa chỉ giao hàng" })
  @MaxLength(300)
  address?: string;

  @IsEnum(PaymentMethod, { message: "Phương thức thanh toán không hợp lệ" })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsToUse?: number;

  // Chi nhánh khách đã chọn (trang "Chọn cửa hàng")
  @IsOptional()
  @IsString()
  @MaxLength(50)
  storeId?: string;
}

export class UpdateOrderStatusDto {
  @IsIn([OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.CANCELLED])
  status: OrderStatus;
}
