import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class ReturnUserDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    isAdmin: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    version: number;

    @ApiProperty()
    createdById: number;

    @ApiProperty()
    updatedById: number;

    constructor(user: UserEntity) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.isAdmin = user.isAdmin;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.version = user.version;
        this.createdById = user.createdById;
        this.updatedById = user.updatedById;
    }
}