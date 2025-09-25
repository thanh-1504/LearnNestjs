import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import envConfig from 'src/shared/config';
import { SharedRoleService } from 'src/shared/repositories/share-role.repo';
import { v4 as uuidv4 } from 'uuid';
import { HashingService } from './../shared/services/hashing.service';
import { AuthRepository } from './auth-repository';
import { GoogleAuthStateType } from './auth.model';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client;
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly sharedRoleService: SharedRoleService,
    private readonly hashingService: HashingService,
    private readonly authService: AuthService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    );
  }
  getGoogleAuthLink({ userAgent, ip }: GoogleAuthStateType) {
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];
    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString(
      'base64',
    );
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      include_granted_scopes: true,
      state: stateString,
    });
    return { url };
  }

  async googleCallBack({ state, code }: { state: string; code: string }) {
    try {
      let userAgent = 'Unknown';
      let ip = 'Unknown';
      try {
        if (state) {
          const clientInfo = JSON.parse(
            Buffer.from(state, 'base64').toString(),
          ) as GoogleAuthStateType;
          userAgent = clientInfo.userAgent;
          ip = clientInfo.ip;
        }
      } catch (error) {
        console.log(error);
      }
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({
        auth: this.oauth2Client,
        version: 'v2',
      });
      const { data } = await oauth2.userinfo.get();
      if (!data.email) throw new Error("Can't get userinfo from google");
      let user = await this.authRepo.findUniqueUserIncludeRole({
        email: data.email,
      });
      if (!user) {
        const clientRoleId = await this.sharedRoleService.getClientRoleId();
        user = await this.authRepo.createUserIncludeRole({
          email: data.email,
          name: data.name ?? '',
          password: await this.hashingService.hashPassword(uuidv4()),
          avatar: data.picture ?? '',
          phoneNumber: '',
          roleId: clientRoleId,
        });
      }
      const device = await this.authRepo.createDevice({
        userId: user.id,
        userAgent,
        ip,
      });
      const authTokens = await this.authService.generateTokens({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      });
      return authTokens;
    } catch (error) {
      console.error('Error in googleCallback', error);
      throw error;
    }
  }
}
