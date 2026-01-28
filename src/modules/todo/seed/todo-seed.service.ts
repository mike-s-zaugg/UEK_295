import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';

@Injectable()
export class TodoSeedService implements OnModuleInit {
  private readonly logger = new Logger(TodoSeedService.name);

  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepo: Repository<TodoEntity>,
  ) {}

  async onModuleInit() {
    await this.seedTodos();
  }

  private async seedTodos() {
    const count = await this.todoRepo.count();
    if (count > 0) {
      this.logger.log('Todos already seeded');
      return;
    }

    this.logger.log('Seeding initial Todos...');

    // IDs für User (Admin=1, User=2 gemäß UserSeedService Annahme)
    const adminId = 1;
    const userId = 2;

    const todos = [
      {
        title: 'OpenAdmin',
        description: 'Example of an open admin todo',
        isClosed: false,
        createdById: adminId,
        updatedById: adminId,
      },
      {
        title: 'ClosedAdmin',
        description: 'Example of a closed admin todo',
        isClosed: true,
        createdById: adminId,
        updatedById: adminId,
      },
      {
        title: 'OpenUser',
        description: 'Example of an open user todo',
        isClosed: false,
        createdById: userId,
        updatedById: userId,
      },
      {
        title: 'ClosedUser',
        description: 'Example of a closed user todo',
        isClosed: true,
        createdById: userId,
        updatedById: userId,
      },
    ];

    for (const todoData of todos) {
      const todo = this.todoRepo.create(todoData);
      await this.todoRepo.save(todo);
    }
    this.logger.log('Todos seeded successfully');
  }
}