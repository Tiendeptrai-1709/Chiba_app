import { Transform } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsString, Matches, Max, MaxLength, Min, NotEquals } from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

// Nhân viên quét QR khách → nhập số tiền hóa đơn tại quầy → cộng điểm.
export class StoreEarnDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toUpperCase() : value))
  @Matches(/^Z\d{8}$/, { message: "Mã khách hàng không hợp lệ" })
  customerCode: string;

  @IsInt({ message: "Số tiền phải là số nguyên" })
  @Min(10_000, { message: "Hóa đơn tối thiểu 10.000đ mới được tích điểm" })
  @Max(100_000_000)
  billAmount: number;
}

// Trừ điểm đổi quà tại quầy (STAFF/ADMIN) hoặc điều chỉnh điểm (chỉ ADMIN).
export class AdjustPointsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt({ message: "Số điểm phải là số nguyên" })
  @NotEquals(0, { message: "Số điểm phải khác 0" })
  @Min(-100_000)
  @Max(100_000)
  points: number;

  @IsIn(["REDEEMED_STORE", "ADMIN_ADJUST"])
  type: "REDEEMED_STORE" | "ADMIN_ADJUST";

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Vui lòng nhập lý do / tên quà" })
  @MaxLength(200)
  description: string;
}
