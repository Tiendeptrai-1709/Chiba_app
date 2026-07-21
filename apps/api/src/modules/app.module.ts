import { Module } from "@nestjs/common";

import { AuthModule } from "./auth.module";
import { UserModule } from "./user.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { AppController } from "src/controllers/app.controller";
import { AppService } from "src/services/app.service";

@Module({
  imports: [PrismaModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
