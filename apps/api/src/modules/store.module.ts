import { Module } from "@nestjs/common";
import { StoreController } from "../controllers/store.controller";
import { StaffInviteController } from "../controllers/staff-invite.controller";

@Module({
  controllers: [StoreController, StaffInviteController],
})
export class StoreModule {}
