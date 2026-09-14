import { Module } from "@nestjs/common";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";
import { ProductController } from "src/controllers/product.controller";
import { ProductService } from "src/services/product.service";


@Module({
    imports:[CloudinaryModule],
    controllers:[ProductController],
    providers:[ProductService]
})

export class ProductModule{}