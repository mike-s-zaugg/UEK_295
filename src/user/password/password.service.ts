import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password);
    }

    async comparePassword(hash: string, plain: string): Promise<boolean> {
        return await argon2.verify(hash, plain);
    }
}