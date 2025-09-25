import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permission.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import {
  GetUserProfileResDTO,
  UpdateProfileResDTO,
} from 'src/shared/dtos/shared-user.dto';
import { AccessTokenPayload } from 'src/shared/types/jwt.type';
import {
  CreaterUserDto,
  CreateUserResDto,
  GetListUserQueriesDto,
  GetListUserResDto,
  GetUserParamDto,
  UpdateUserDto,
} from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ZodSerializerDto(GetListUserResDto)
  async getListUsers(@Query() getListUsersQueries: GetListUserQueriesDto) {
    const result = await this.usersService.getListUsers(getListUsersQueries);
    console.log('Actual data:', JSON.stringify(result, null, 2));
    return result;
  }

  @Get('/:userId')
  @ZodSerializerDto(GetUserProfileResDTO)
  getUser(@Param() params: GetUserParamDto) {
    return this.usersService.getUser(params.userId);
  }

  @Post()
  @ZodSerializerDto(CreateUserResDto)
  create(
    @Body() createUserDto: CreaterUserDto,
    @ActiveUser() user: AccessTokenPayload,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.usersService.create({
      data: createUserDto,
      createdById: user.userId,
      createdByRoleName: roleName,
    });
  }

  @Put('/:userId')
  @ZodSerializerDto(UpdateProfileResDTO)
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Param() params: GetUserParamDto,
    @ActiveUser() userCurrent: AccessTokenPayload,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.usersService.update({
      data: updateUserDto,
      id: params.userId,
      updatedById: userCurrent.userId,
      updatedByRoleName: roleName,
    });
  }

  @Delete('/:userId')
  delete(
    @Param() params: GetUserParamDto,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: string,
  ) {
    return this.usersService.delete({
      id: params.userId,
      deletedById: userId,
      deletedByRoleName: roleName,
    });
  }
}
