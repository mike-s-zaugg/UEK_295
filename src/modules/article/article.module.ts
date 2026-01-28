// src/modules/article/article.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './service/article.service';
import { ArticleController } from './controller/article.controller';
import { ArticleEntity } from './entities/article.entity';
import { AuthModule } from '../auth/auth.module';
import { ArticleSeedService } from './seed/article-seed.service';

/**
 * ArticleModule is responsible for handling the article-related domain logic.
 *
 * This module integrates with TypeOrm to manage database operations for articles
 * and interacts with authentication mechanisms via the AuthModule. It provides
 * the necessary controllers and services for CRUD operations, seeding, and
 * other functionalities related to articles.
 *
 * Components:
 * - Imports:
 *   - TypeOrmModule: Configured to manage ArticleEntity for database operations.
 *   - AuthModule: Provides authentication capabilities for protecting article-related endpoints.
 * - Controllers:
 *   - ArticleController: Handles incoming HTTP requests related to articles and delegates them to the appropriate services.
 * - Providers:
 *   - ArticleService: Contains the business logic for managing articles.
 *   - ArticleSeedService: Responsible for seeding initial article data into the database.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), AuthModule],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleSeedService],
})
export class ArticleModule {}
