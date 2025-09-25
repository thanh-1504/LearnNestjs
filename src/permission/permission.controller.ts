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
  CreatePermissionDto,
  GetPermissionDetailResDto,
  GetPermissionParamsDto,
  GetPermissionQueryDto,
  GetPermissionResDto,
  UpdatePermissionDto,
} from './permission.dto';
import { PermissionService } from './permission.service';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Get()
  @ZodSerializerDto(GetPermissionResDto)
  list(@Query() queries: GetPermissionQueryDto) {
    return this.permissionService.getList({
      page: queries.page,
      limit: queries.limit,
    });
  }

  @Get(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDto)
  findById(@Param() params: GetPermissionParamsDto) {
    return this.permissionService.findById(params);
  }

  @Post()
  @ZodSerializerDto(GetPermissionDetailResDto)
  @ZodSerializerDto(GetPermissionDetailResDto)
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.create(createPermissionDto, userId);
  }

  @Put(':permissionId')
  update(
    @ActiveUser('userId') userId: number,
    @Param() params: GetPermissionParamsDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(updatePermissionDto, params, userId);
  }

  @Delete(':permissionId')
  @ZodSerializerDto(ResponseMessageDto)
  delete(
    @Param('permissionId') permissionId: number,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.delete(+permissionId, userId);
  }
}
