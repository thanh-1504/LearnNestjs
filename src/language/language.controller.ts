import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { ResponseMessageDto } from 'src/shared/dtos/response.dto';
import {
  CreateLanguageDto,
  GetDetailLanguageDto,
  GetLanguageParamsDto,
  GetLanguagesResDto,
  UpdateLanguageDto,
} from './language.dto';
import { LanguageService } from './language.service';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}
  @Get()
  @ZodSerializerDto(GetLanguagesResDto)
  getLanguages() {
    return this.languageService.getLanguages();
  }

  @Get(':languageId')
  @ZodSerializerDto(GetDetailLanguageDto)
  getDetailLanguage(@Param() params: GetLanguageParamsDto) {
    return this.languageService.getDetailLanguage(params.languageId);
  }

  @Post()
  @ZodSerializerDto(GetDetailLanguageDto)
  createLanguage(
    @Body() createLanguageDto: CreateLanguageDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.createLanguage({
      data: createLanguageDto,
      createdById: userId,
    });
  }

  @Put(':languageId')
  @ZodSerializerDto(GetDetailLanguageDto)
  updatedLanguage(
    @Body() body: UpdateLanguageDto,
    @Param() params: GetLanguageParamsDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.updateLanguage({
      data: body,
      updatedById: userId,
      id: params.languageId,
    });
  }

  @Delete(':languageId')
  @ZodSerializerDto(ResponseMessageDto)
  deleteLanguage(@Param('languageId') languageId: string) {
    return this.languageService.deleteLanguage(languageId);
  }
}
