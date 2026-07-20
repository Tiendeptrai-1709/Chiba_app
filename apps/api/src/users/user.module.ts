import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserSevice } from "./user.service";

@Module({
    controllers:[UserController],
    providers:[UserSevice]
})

export class UserModule{}