import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Lấy `request.user` do Passport gắn vào (AuthUser hoặc RefreshUser).
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
