import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity';
import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';

interface MockRepository {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  remove: jest.Mock;
}

describe('TodoService', () => {
  let service: TodoService;
  let todoRepo: MockRepository;

  beforeEach(async () => {
    todoRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: todoRepo,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const dto = { title: 'Test Todo', description: 'Desc' };
      const userId = 1;
      const corrId = 123;
      const savedTodo = { id: 1, ...dto, createdById: userId, isClosed: false };

      todoRepo.create.mockReturnValue(savedTodo);
      todoRepo.save.mockResolvedValue(savedTodo);

      const result = await service.create(corrId, userId, dto);

      expect(todoRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        title: dto.title,
        createdById: userId,
        isClosed: false,
      }));
      expect(todoRepo.save).toHaveBeenCalledWith(savedTodo);
      expect(result).toEqual(savedTodo);
    });
  });

  describe('findAll', () => {
    it('should return all todos for admin', async () => {
      const todos = [{ id: 1 }, { id: 2 }];
      todoRepo.find.mockResolvedValue(todos);

      const result = await service.findAll(1, 1, true);

      expect(todoRepo.find).toHaveBeenCalled();
      expect(result).toEqual(todos);
    });

    it('should return only own todos for non-admin', async () => {
      const userId = 2;
      const todos = [{ id: 1, createdById: userId }];
      todoRepo.find.mockResolvedValue(todos);

      const result = await service.findAll(1, userId, false);

      expect(todoRepo.find).toHaveBeenCalledWith({ where: { createdById: userId } });
      expect(result).toEqual(todos);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if todo not found', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1, 999, 1, true)).rejects.toThrow(NotFoundException);
    });

    it('should return todo for admin regardless of owner', async () => {
      const todo = { id: 1, createdById: 2, isClosed: false };
      todoRepo.findOne.mockResolvedValue(todo);

      const result = await service.findOne(1, 1, 1, true);
      expect(result).toEqual(todo);
    });

    it('should return todo for owner if open', async () => {
      const userId = 2;
      const todo = { id: 1, createdById: userId, isClosed: false };
      todoRepo.findOne.mockResolvedValue(todo);

      const result = await service.findOne(1, 1, userId, false);
      expect(result).toEqual(todo);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const userId = 2;
      const todo = { id: 1, createdById: 3, isClosed: false };
      todoRepo.findOne.mockResolvedValue(todo);

      await expect(service.findOne(1, 1, userId, false)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if todo is closed for user', async () => {
      const userId = 2;
      const todo = { id: 1, createdById: userId, isClosed: true };
      todoRepo.findOne.mockResolvedValue(todo);

      await expect(service.findOne(1, 1, userId, false)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if todo not found', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, 999, 1, true, {})).rejects.toThrow(NotFoundException);
    });

    it('should update todo for admin', async () => {
      const todo = { id: 1, title: 'Old' };
      const dto = { title: 'New' };
      todoRepo.findOne.mockResolvedValue(todo);
      todoRepo.save.mockResolvedValue({ ...todo, ...dto });

      const result = await service.update(1, 1, 1, true, dto);
      expect(todoRepo.save).toHaveBeenCalled();
      expect(result.title).toBe('New');
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const todo = { id: 1, createdById: 2 };
      todoRepo.findOne.mockResolvedValue(todo);

      await expect(service.update(1, 1, 3, false, {})).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user tries to reopen closed todo', async () => {
      const userId = 2;
      const todo = { id: 1, createdById: userId, isClosed: true };
      todoRepo.findOne.mockResolvedValue(todo);

      await expect(service.update(1, 1, userId, false, { isClosed: false })).rejects.toThrow(ForbiddenException);
    });

    it('should allow user to update open todo', async () => {
      const userId = 2;
      const todo = { id: 1, createdById: userId, isClosed: false, title: 'Old' };
      todoRepo.findOne.mockResolvedValue(todo);
      todoRepo.save.mockResolvedValue({ ...todo, title: 'New' });

      const result = await service.update(1, 1, userId, false, { title: 'New' });
      expect(result.title).toBe('New');
    });
  });

  describe('updateAdmin', () => {
    it('should update isClosed status', async () => {
      const todo = { id: 1, isClosed: false };
      todoRepo.findOne.mockResolvedValue(todo);
      todoRepo.save.mockResolvedValue({ ...todo, isClosed: true });

      const result = await service.updateAdmin(1, 1, { isClosed: true });
      expect(todo.isClosed).toBe(true);
      expect(todoRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if todo missing', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.updateAdmin(1, 1, { isClosed: true })).rejects.toThrow(NotFoundException);
    });
  });

  describe('replace', () => {
    it('should replace todo data', async () => {
      const todo = { id: 1, title: 'Old' };
      const dto = { id: 1, version: 1, title: 'New' };
      todoRepo.findOne.mockResolvedValue(todo);
      todoRepo.save.mockResolvedValue({ ...todo, title: 'New' });

      await service.replace(1, 1, dto);
      expect(Object.assign(todo, dto)).toMatchObject({ title: 'New' });
      expect(todoRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if todo missing', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.replace(1, 1, { id: 1, version: 1 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException if not admin', async () => {
      await expect(service.remove(1, 1, false)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if todo not found', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 1, true)).rejects.toThrow(NotFoundException);
    });

    it('should remove todo if admin and todo exists', async () => {
      const todo = { id: 1 };
      todoRepo.findOne.mockResolvedValue(todo);
      todoRepo.remove.mockResolvedValue(todo);

      const result = await service.remove(1, 1, true);
      expect(todoRepo.remove).toHaveBeenCalledWith(todo);
      expect(result).toEqual(todo);
    });
  });
});