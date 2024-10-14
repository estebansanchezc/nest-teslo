import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    //console.log({ request: req, usuario: user });
    if (!user)
      throw new InternalServerErrorException('User not found (request) 1');

    return !data ? user : user[data];
  },
);
