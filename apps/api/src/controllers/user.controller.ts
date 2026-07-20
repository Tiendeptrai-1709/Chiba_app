import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserSevice } from "../services/user.service";
import { CreateUserDto } from "../dto/create-user.dto";

@Controller("users")
export class UserController{
    constructor (private readonly userService:UserSevice){}

    @Post()
    create(@Body() dto:CreateUserDto){
        return this.userService.createUser(dto)
    }

    @Get()
    get(){
        return this.userService.findAllUser();
    }
}