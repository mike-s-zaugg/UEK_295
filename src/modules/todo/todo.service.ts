import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  private readonly logger = new Logger(TodoService.name);

  constructor(
    @InjectRepository(TodoEntity)
    private todoRepo: Repository<TodoEntity>,
  ) {}

  async create(
    corrId: number,
    userId: number,
    createTodoDto: CreateTodoDto,
  ): Promise<ReturnTodoDto> {
    this.logger.log(
      `${corrId} create called with userId: ${userId}, dto: ${JSON.stringify(createTodoDto)}`,
    );
    const todo = this.todoRepo.create({
      ...createTodoDto,
      createdById: userId,
      updatedById: userId,
      isClosed: false,
    });
    const result = (await this.todoRepo.save(todo)) as any;
    this.logger.log(`${corrId} create result: ${JSON.stringify(result)}`);
    return result;
  }

  async findAll(
    corrId: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<ReturnTodoDto[]> {
    this.logger.log(
      `${corrId} findAll called with userId: ${userId}, isAdmin: ${isAdmin}`,
    );
    let result;
    if (isAdmin) {
      result = (await this.todoRepo.find()) as any;
    } else {
      result = (await this.todoRepo.find({
        where: { createdById: userId, isClosed: false },
      })) as any;
    }
    this.logger.log(`${corrId} findAll result count: ${result.length}`);
    return result;
  }

  async findOne(
    corrId: number,
    id: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<ReturnTodoDto> {
    this.logger.log(
      `${corrId} findOne called with id: ${id}, userId: ${userId}, isAdmin: ${isAdmin}`,
    );
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }

    if (isAdmin) {
      this.logger.log(`${corrId} findOne result: ${JSON.stringify(todo)}`);
      return todo as any;
    }

    if (todo.createdById !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (todo.isClosed) {
      throw new NotFoundException(`Todo with id ${id} not found or is closed`);
    }

    this.logger.log(`${corrId} findOne result: ${JSON.stringify(todo)}`);
    return todo as any;
  }

  async update(
    corrId: number,
    id: number,
    userId: number,
    isAdmin: boolean,
    updateDto: UpdateTodoDto,
  ): Promise<ReturnTodoDto> {
    this.logger.log(
      `${corrId} update called with id: ${id}, userId: ${userId}, isAdmin: ${isAdmin}, dto: ${JSON.stringify(updateDto)}`,
    );
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();

    if (!isAdmin) {
      if (todo.createdById !== userId) throw new ForbiddenException();
      if (updateDto.isClosed === false && todo.isClosed === true) {
        throw new ForbiddenException('User cannot reopen todos');
      }
    }

    Object.assign(todo, updateDto);
    todo.updatedById = userId;

    const result = await this.todoRepo.save(todo);
    this.logger.log(`${corrId} update result: ${JSON.stringify(result)}`);
    return { ...result } as unknown as ReturnTodoDto;
  }

  async updateAdmin(
    corrId: number,
    id: number,
    dto: UpdateTodoAdminDto,
  ): Promise<ReturnTodoDto> {
    this.logger.log(
      `${corrId} updateAdmin called with id: ${id}, dto: ${JSON.stringify(dto)}`,
    );
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();

    todo.isClosed = dto.isClosed;
    const result = (await this.todoRepo.save(todo)) as any;
    this.logger.log(`${corrId} updateAdmin result: ${JSON.stringify(result)}`);
    return result;
  }

  async replace(
    corrId: number,
    id: number,
    dto: ReplaceTodoDto,
  ): Promise<ReturnTodoDto> {
    this.logger.log(
      `${corrId} replace called with id: ${id}, dto: ${JSON.stringify(dto)}`,
    );
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();
    Object.assign(todo, dto);
    const result = (await this.todoRepo.save(todo)) as any;
    this.logger.log(`${corrId} replace result: ${JSON.stringify(result)}`);
    return result;
  }

  async remove(
    corrId: number,
    id: number,
    isAdmin: boolean,
    userId: number,
  ): Promise<ReturnTodoDto> {
    this.logger.log(
      `${corrId} remove called with id: ${id}, isAdmin: ${isAdmin}`,
    );
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete todos');
    }
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) throw new NotFoundException();

    await this.todoRepo.remove(todo);

    const todoToReturn = { ...todo, updatedById: userId };

    this.logger.log(`${corrId} remove result: ${JSON.stringify(todoToReturn)}`);
    return todoToReturn as unknown as ReturnTodoDto;
  }
}
