import { Injectable } from '@nestjs/common';
import {
  CreateLanguageBodyType,
  LanguageBodyType,
  UpdateLanguageBodyType,
} from './language.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class LanguageRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<LanguageBodyType[]> {
    return this.prismaService.language.findMany({
      where: { deletedAt: null },
    });
  }

  findById(id: string): Promise<LanguageBodyType | null> {
    return this.prismaService.language.findUnique({
      where: { id, deletedAt: null },
    });
  }

  create({
    createdById,
    data,
  }: {
    createdById: number;
    data: CreateLanguageBodyType;
  }): Promise<CreateLanguageBodyType> {
    return this.prismaService.language.create({
      data: {
        createdById,
        ...data,
      },
    });
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: string;
    updatedById: number;
    data: UpdateLanguageBodyType;
  }): Promise<LanguageBodyType> {
    return this.prismaService.language.update({
      where: { id, deletedAt: null },
      data: {
        updatedById,
        ...data,
      },
    });
  }

  delete(id: string, isHard?: boolean): Promise<LanguageBodyType> {
    return isHard
      ? this.prismaService.language.delete({
          where: { id },
        })
      : this.prismaService.language.update({
          where: { id, deletedAt: null },
          data: {
            deletedAt: new Date(),
          },
        });
  }
}
