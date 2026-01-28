import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';

/**
 * Service responsible for seeding article data into the database during the application's bootstrap phase.
 * It ensures predefined articles are inserted or updated in the data store.
 *
 * @implements {OnApplicationBootstrap}
 */
@Injectable()
export class ArticleSeedService implements OnApplicationBootstrap {
  /**
   * An instance of the Logger class configured for the ArticleSeedService.
   * Used to log messages, errors, and other information specific to the ArticleSeedService.
   */
  private readonly logger = new Logger(ArticleSeedService.name);

  /**
   * Creates a new instance of the class with the provided data source.
   *
   * @param {DataSource} dataSource - The data source to be used by the instance.
   */
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Hook that is executed when the application finishes initializing.
   * This method is typically used to perform actions needed after the application's setup is complete, such as seeding initial data.
   *
   * @return {Promise<void>} A promise that resolves when the bootstrap actions, such as seeding, are completed.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  /**
   * Seeds the database with initial data for the Article entity.
   *
   * This method performs an upsert operation on the data repository
   * for the Article entity. If an entry with the given ID exists, it updates
   * the entry; otherwise, it creates a new entry. Includes debug logging
   * for monitoring the seed process.
   *
   * @return {Promise<void>} A promise that resolves when the seeding process completes.
   */
  async seed(): Promise<void> {
    const articleRepo = this.dataSource.getRepository(ArticleEntity);
    this.logger.debug(`${this.seed.name}: start`);
    await this.upsertById(
      articleRepo,
      1,
      'Sample Article',
      'Example of Article Description',
      10.5,
      1,
    );
  }

  /**
   * Inserts or updates an article entity based on the provided ID. If an article with the given ID already exists, this method will not perform any actions.
   * Otherwise, it inserts a new article with the provided attributes.
   *
   * @param {Repository<ArticleEntity>} articleRepo - The repository used to interact with the article entity.
   * @param {number} id - The unique identifier of the article to be inserted or updated.
   * @param {string} articleName - The name of the article.
   * @param {string} articleDescription - The description of the article.
   * @param {number} articlePrice - The price of the article.
   * @param {number} userId - The ID of the user performing the operation, used for tracking the creator and updater of the record.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  private async upsertById(
    articleRepo: Repository<ArticleEntity>,
    id: number,
    articleName: string,
    articleDescription: string,
    articlePrice: number,
    userId: number,
  ): Promise<void> {
    this.logger.verbose(
      `${this.upsertById.name}: id=${id}, articleName=${articleName}, articleDescription=${articleDescription}, articlePrice=${articlePrice}`,
    );
    const existing = await articleRepo.findOneBy({ id });
    if (existing) return;
    await articleRepo.upsert(
      {
        id,
        articleName,
        articleDescription,
        articlePrice,
        createdById: userId,
        updatedById: userId,
      },
      { conflictPaths: ['id'] },
    );
  }
}
