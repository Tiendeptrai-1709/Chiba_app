import { Module } from "@nestjs/common";
import { UserController } from "../controllers/user.controller";
import { UserSevice } from "../services/user.service";

@Module({
    controllers:[UserController],
    providers:[UserSevice]
})

export class UserModule{}