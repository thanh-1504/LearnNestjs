import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_ROLE } from '../constrants/auth-contrants';
import { RolePermissionType } from '../models/shared-role.model';

export const ActiveRolePermissions = createParamDecorator(
  (fields: keyof RolePermissionType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: RolePermissionType | undefined = request[REQUEST_USER_ROLE];
    return fields ? user?.[fields] : user;
  },
);
