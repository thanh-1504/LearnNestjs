import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_USER_KEY } from "../constrants/auth-contrants";
import { AccessTokenPayload } from "./../types/jwt.type";

export const ActiveUser = createParamDecorator(
  (fields: keyof AccessTokenPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY];
    return fields ? user?.[fields] : user;
  },
);
