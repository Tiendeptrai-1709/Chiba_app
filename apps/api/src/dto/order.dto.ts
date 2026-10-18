import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { OrderStatus } from "src/generated/prisma";

export enum OrderType {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

export class CreateOrderDto {
  @IsEnum(OrderType)
  orderType: OrderType;

  @ValidateIf((dto) => dto.orderType === OrderType.DELIVERY)
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsUsed?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateStatusOrderDto {
  @IsEnum(OrderStatus)
  newStatus: OrderStatus;
}
