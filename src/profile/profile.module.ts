import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';

@Module({
  providers: [ProfileService,ShareUserRepository],
  controllers: [ProfileController]
})
export class ProfileModule {}
