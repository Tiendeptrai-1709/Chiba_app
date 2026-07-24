import { Module } from "@nestjs/common";

import { AuthModule } from "./auth.module";
import { UserModule } from "./user.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { AppController } from "src/controllers/app.controller";
import { AppService } from "src/services/app.service";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 3 }]),
    PrismaModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
