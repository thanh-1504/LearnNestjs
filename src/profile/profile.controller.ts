import { Body, Controller, Get, Put } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ResponseMessageDto } from 'src/shared/dtos/response.dto';
import {
  ChangePasswordDto,
  GetUserProfileDto,
  UpdateMeDto,
  UpdateProfileDto,
} from './profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get()
  @ZodSerializerDto(GetUserProfileDto)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ZodSerializerDto(UpdateProfileDto)
  updateProfile(
    @Body() updateProfileDto: UpdateMeDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.profileService.updateProfile(updateProfileDto, userId);
  }

  @Put('change-password')
  @ZodSerializerDto(ResponseMessageDto)
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.profileService.changePassword(changePasswordDto, userId);
  }
}
