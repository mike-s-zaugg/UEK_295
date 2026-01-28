import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TodoService } from './todo.service'; // Pfad angepasst (gleicher Ordner)
import { AuthGuard } from '../auth/guards/auth.guard'; // Pfad angepasst (ein Ordner hoch zu auth)
import { CreateTodoDto } from './dto/create-todo.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateTodoAdminDto } from './dto/update-todo-admin.dto';
import { ReplaceTodoDto } from './dto/replace-todo.dto';
import { IsAdmin, UserId } from '../auth/decorators'; // Pfad angepasst
import { CorrId } from '../../decorators/corr-id.decorator'; // Pfad angepasst (src/decorators)

@ApiTags('todo')
@Controller('todo')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Create todo' })
  @ApiResponse({ status: 201, type: ReturnTodoDto })
  create(
    @CorrId() corrId: number,
    @UserId() userId: number,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todoService.create(corrId, userId, createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos' })
  @ApiResponse({ status: 200, type: [ReturnTodoDto] })
  findAll(
    @CorrId() corrId: number,
    @UserId() userId: number,
    @IsAdmin() isAdmin: boolean,
  ) {
    return this.todoService.findAll(corrId, userId, isAdmin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get todo by id' })
  findOne(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
    @IsAdmin() isAdmin: boolean,
  ) {
    return this.todoService.findOne(corrId, id, userId, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update todo' })
  update(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
    @IsAdmin() isAdmin: boolean,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todoService.update(corrId, id, userId, isAdmin, updateTodoDto);
  }

  @Patch(':id/admin')
  @ApiOperation({ summary: 'Set todo by admin' })
  updateAdmin(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoAdminDto,
  ) {
    return this.todoService.updateAdmin(corrId, id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Replace todo' })
  replace(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceTodoDto,
  ) {
    return this.todoService.replace(corrId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete todo' })
  remove(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    return this.todoService.remove(corrId, id, isAdmin, userId);
  }
}
