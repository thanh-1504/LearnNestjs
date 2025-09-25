import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import {
  CreateLanguageBodyType,
  UpdateLanguageBodyType,
} from './language.model';
import { LanguageRepo } from './language.repo';

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepo: LanguageRepo) {}

  async getLanguages() {
    const data = await this.languageRepo.findAll();
    return {
      data,
      totalItems: data.length,
    };
  }

  async getDetailLanguage(languageId: string) {
    const language = await this.languageRepo.findById(languageId);
    if (!language)
      throw new UnprocessableEntityException({
        code: 'custom',
        message: 'Languague not found!',
      });
    return language;
  }

  async createLanguage({
    data,
    createdById,
  }: {
    data: CreateLanguageBodyType;
    createdById: number;
  }) {
    try {
      return await this.languageRepo.create({
        createdById,
        data,
      });
    } catch (error) {
      throw new UnprocessableEntityException({
        code: 'custom',
        path: 'id',
        message: 'Language is already exists',
      });
    }
  }

  async updateLanguage({
    id,
    data,
    updatedById,
  }: {
    id: string;
    updatedById: number;
    data: UpdateLanguageBodyType;
  }) {
    try {
      return await this.languageRepo.update({ id, data, updatedById });
    } catch (error) {
      throw new UnprocessableEntityException({
        code: 'custom',
        path: 'id',
        message: 'Not found language',
      });
    }
  }

  async deleteLanguage(languageId: string) {
    try {
      await this.languageRepo.delete(languageId, true);
      return {
        message: 'Delete successfully',
      };
    } catch (error) {
      throw new UnprocessableEntityException({
        code: 'custom',
        path: 'id',
        message: 'Not found language',
      });
    }
  }
}
