import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";

@Injectable()
export class HashingService {
  hashPassword(password: string) {
    return hash(password, 10);
  }

  comparePassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }
}
