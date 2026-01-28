import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { PasswordService } from './password/password.service';
import { UserController } from './user.controller';
import { UserEntity } from './entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [UserService, PasswordService],
    exports: [UserService, PasswordService],
})
export class UserModule {}