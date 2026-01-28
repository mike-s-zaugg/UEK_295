import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateTodoAdminDto } from './dto/update-todo-admin.dto';
import { ReplaceTodoDto } from './dto/replace-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(TodoEntity)
    private todoRepo: Repository<TodoEntity>,
  ) {}

  async create(corrId: number, userId: number, createTodoDto: CreateTodoDto): Promise<ReturnTodoDto> {
    const todo = this.todoRepo.create({
      ...createTodoDto,
      createdById: userId,
      updatedById: userId,
      isClosed: false,
    });
    return await this.todoRepo.save(todo) as any;
  }

  async findAll(corrId: number, userId: number, isAdmin: boolean): Promise<ReturnTodoDto[]> {
    if (isAdmin) {
      return await this.todoRepo.find() as any;
    } else {
      return await this.todoRepo.find({ where: { createdById: userId } }) as any;
    }
  }

  async findOne(corrId: number, id: number, userId: number, isAdmin: boolean): Promise<ReturnTodoDto> {
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    if (isAdmin) {
      return todo as any;
    }

    // User Logik
    if (todo.createdById !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (todo.isClosed) {
      throw new NotFoundException(`Todo with id ${id} not found or is closed`);
    }

    return todo as any;
  }

  async update(corrId: number, id: number, userId: number, isAdmin: boolean, updateDto: UpdateTodoDto): Promise<ReturnTodoDto> {
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();

    if (!isAdmin) {
      if (todo.createdById !== userId) throw new ForbiddenException();
      // User darf nicht wieder öffnen
      if (updateDto.isClosed === false && todo.isClosed === true) {
        throw new ForbiddenException('User cannot reopen todos');
      }
    }

    Object.assign(todo, updateDto);
    todo.updatedById = userId;

    return await this.todoRepo.save(todo) as any;
  }

  async updateAdmin(corrId: number, id: number, dto: UpdateTodoAdminDto): Promise<ReturnTodoDto> {
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();

    todo.isClosed = dto.isClosed;
    return await this.todoRepo.save(todo) as any;
  }

  async replace(corrId: number, id: number, dto: ReplaceTodoDto): Promise<ReturnTodoDto> {
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();
    Object.assign(todo, dto);
    return await this.todoRepo.save(todo) as any;
  }

  async remove(corrId: number, id: number, isAdmin: boolean): Promise<ReturnTodoDto> {
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete todos');
    }
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();

    return await this.todoRepo.remove(todo) as any;
  }
}