import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

//Guard hoạt động như middlewares
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt"){}