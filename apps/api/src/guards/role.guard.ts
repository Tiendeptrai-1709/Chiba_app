import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "src/generated/prisma";
import { ROLES_KEY } from "src/decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Lấy danh sách role được phép từ metadata @Roles(...)
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        // Nếu route không gắn @Roles(...) thì không giới hạn role, cho qua
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // QUAN TRỌNG: RolesGuard PHẢI chạy SAU JwtAuthGuard trong @UseGuards(...)
        // để request.user đã được JwtStrategy gắn vào trước đó.
        if (!user) {
            throw new ForbiddenException("Bạn cần đăng nhập để thực hiện thao tác này");
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
        }

        return true;
    }
}