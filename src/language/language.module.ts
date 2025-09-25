import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { LanguageRepo } from './language.repo';
import { LanguageService } from './language.service';

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepo],
})
export class LanguageModule {}
