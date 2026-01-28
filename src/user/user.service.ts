import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordService } from './password/password.service';
import { ReturnUserDto } from './dto/return-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly passwordService: PasswordService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<ReturnUserDto> {
        const { username, email, password } = createUserDto;
        const passwordHash = await this.passwordService.hashPassword(password);

        const user = this.userRepository.create({
            username: username.toLowerCase(),
            email,
            passwordHash,
            isAdmin: false,
        });

        try {
            const savedUser = await this.userRepository.save(user);
            this.logger.log(`User created: ${savedUser.username}`);
            return new ReturnUserDto(savedUser);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new ConflictException('Username or Email already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    // FIND ALL
    async findAll(corrId: number): Promise<ReturnUserDto[]> {
        this.logger.verbose(`${corrId} findAll Users`, UserService.name);
        const users = await this.userRepository.find();
        return users.map(user => new ReturnUserDto(user));
    }

    // FIND ONE
    async findOne(corrId: number, id: number): Promise<ReturnUserDto | null> {
        this.logger.verbose(`${corrId} findOne User with id ${id}`, UserService.name);
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) return null;
        return new ReturnUserDto(user);
    }

    // FIND BY USERNAME (für Login)
    async findByUsername(username: string): Promise<UserEntity | undefined> {
        const user = await this.userRepository.findOne({ where: { username } });
        return user || undefined;
    }

    // UPDATE
    async update(corrId: number, id: number, updateUserDto: UpdateUserAdminDto): Promise<ReturnUserDto> {
        this.logger.verbose(`${corrId} update User with id ${id}`, UserService.name);
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        if (updateUserDto.isAdmin !== undefined) {
            user.isAdmin = updateUserDto.isAdmin;
        }

        const updatedUser = await this.userRepository.save(user);
        return new ReturnUserDto(updatedUser);
    }

    // REMOVE
    async remove(corrId: number, id: number): Promise<ReturnUserDto> {
        this.logger.verbose(`${corrId} remove User with id ${id}`, UserService.name);
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        await this.userRepository.remove(user);
        return new ReturnUserDto(user);
    }
}