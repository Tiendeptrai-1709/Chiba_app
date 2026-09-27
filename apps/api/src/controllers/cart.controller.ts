import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { AddCartItemDto, UpdateCartItemDto } from "src/dto/cart.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";
import { CartService } from "src/services/cart.service";

@Controller("cart")
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post("items")
  addItems(@Req() req: Request, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Patch("items/:itemId")
  updateItem(
    @Req() req: Request,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    console.log("first", itemId, dto)
    return this.cartService.updateItem(req.user.userId, itemId, dto);
  }

  @Delete("items/:itemId")
  removeItem(@Req() req: Request, @Param("itemId") itemId: string) {
    return this.cartService.removeItem(req.user.userId, itemId);
  }

  @Delete()
  clearCart(@Req() req: Request) {
    return this.cartService.clearCart(req.user.userId);
  }
}
