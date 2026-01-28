import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CorrId } from '../decorators/corr-id.decorator';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        // Create braucht hier keine CorrId, da Public oder implizit
        return this.userService.create(createUserDto);
    }

    @Get()
    findAll(@CorrId() corrId: number) {
        // Hier übergeben wir corrId an den Service
        return this.userService.findAll(corrId);
    }

    @Get(':id')
    async findOne(@CorrId() corrId: number, @Param('id') id: string) {
        // Hier auch corrId übergeben
        const user = await this.userService.findOne(corrId, +id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    @Patch(':id/admin')
    update(@CorrId() corrId: number, @Param('id') id: string, @Body() updateUserDto: UpdateUserAdminDto) {
        // Und hier auch corrId
        return this.userService.update(corrId, +id, updateUserDto);
    }

    @Delete(':id')
    remove(@CorrId() corrId: number, @Param('id') id: string) {
        // Und hier auch corrId
        return this.userService.remove(corrId, +id);
    }
}