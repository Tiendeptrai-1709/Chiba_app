import { Module } from "@nestjs/common";
import { PointsController } from "../controllers/points.controller";
import { PointsService } from "../services/points.service";

@Module({
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
