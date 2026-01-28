import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { AuthModule } from '../auth/auth.module';
import { TodoSeedService } from './seed/todo-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoEntity]),
    AuthModule,
  ],
  providers: [TodoService, TodoSeedService],
  controllers: [TodoController],
})
export class TodoModule {}