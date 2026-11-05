import { Role } from "../generated/prisma";

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sid: string; // id phiên đăng nhập (bảng sessions) — mỗi thiết bị một phiên
}

// Thông tin user gắn vào request sau khi qua JwtAuthGuard.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  sessionId: string;
}

// Thông tin gắn vào request sau khi qua JwtRefreshGuard.
export interface RefreshUser extends AuthUser {
  refreshToken: string;
}
