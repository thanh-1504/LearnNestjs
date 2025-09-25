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
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ResponseMessageDto } from 'src/shared/dtos/response.dto';
import {
  CreateRoleDto,
  GetQueriesRoleDto,
  GetRoleDetailDto,
  GetRoleParamsDto,
  GetRolesResDto,
  UpdateRoleDto,
} from './roles.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}
  @Get()
  @ZodSerializerDto(GetRolesResDto)
  list(@Query() getQueriesRoleDto: GetQueriesRoleDto) {
    return this.roleService.list({
      page: getQueriesRoleDto.page,
      limit: getQueriesRoleDto.limit,
    });
  }

  @Get(':roleId')
  @ZodSerializerDto(GetRoleDetailDto)
  findById(@Param() getRoleParamDto: GetRoleParamsDto) {
    return this.roleService.findById(getRoleParamDto.roleId);
  }

  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.roleService.create(createRoleDto, userId);
  }

  @Put(':roleId')
  update(
    @Body() updateRoleDto: UpdateRoleDto,
    @ActiveUser('userId') userId: number,
    @Param() getRoleParamDto: GetRoleParamsDto,
  ) {
    return this.roleService.update(
      updateRoleDto,
      getRoleParamDto.roleId,
      userId,
    );
  }

  @Delete(':roleId')
  @ZodSerializerDto(ResponseMessageDto)
  delete(
    @Param() getRoleParamDto: GetRoleParamsDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.roleService.delete(getRoleParamDto.roleId, userId);
  }
}
