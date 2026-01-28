// /src/modules/article/service/article.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ReturnArticleDto } from '../dto/return-article.dto';
import { ReplaceArticleDto } from '../dto/replace-article.dto';

/**
 * Service for managing articles.
 *
 * Provides methods for creating, retrieving, updating, replacing, and deleting articles.
 */
@Injectable()
export class ArticleService {
  /**
   * Constructor for initializing the service with a repository.
   *
   * @param {Repository<ArticleEntity>} repo - The repository instance for handling ArticleEntity operations.
   */
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly repo: Repository<ArticleEntity>,
  ) {}

  // region private methods
  /**
   * Converts an ArticleEntity instance into a ReturnArticleDto.
   *
   * @param {ArticleEntity} entity - The ArticleEntity object to be converted.
   * @return {ReturnArticleDto} The resulting ReturnArticleDto object.
   */
  private entityToDto(entity: ArticleEntity): ReturnArticleDto {
    return {
      id: entity.id,
      articleName: entity.articleName,
      articleDescription: entity.articleDescription,
      articlePrice: entity.articlePrice,
      createdAt: entity.createdAt,
      createdById: entity.createdById,
      updatedAt: entity.updatedAt,
      updatedById: entity.updatedById,
      version: entity.version,
    } as ReturnArticleDto;
  }
  // endregion private methods

  // region public methods
  /**
   * Creates a new article entity, assigns the creating user's ID, saves it to the repository, and returns the created article as a DTO.
   *
   * @param {number} userId - The ID of the user creating the article.
   * @param {CreateArticleDto} createDto - The data transfer object containing the details to create the article.
   * @return {Promise<ReturnArticleDto>} - A promise that resolves to the created article in DTO format.
   */
  async create(
    userId: number,
    createDto: CreateArticleDto,
  ): Promise<ReturnArticleDto> {
    const createEntity = this.repo.create(createDto);
    createEntity.createdById = userId;
    createEntity.updatedById = userId;
    const savedEntity = await this.repo.save(createEntity);
    return this.entityToDto(savedEntity);
  }

  /**
   * Retrieves all entries from the repository and converts them to DTOs.
   *
   * @return {Promise<ReturnArticleDto[]>} A promise that resolves to an array of data transfer objects (DTOs) representing all entries.
   */
  async findAll(): Promise<ReturnArticleDto[]> {
    // find all entries
    const arr = await this.repo.find();
    // convert each entry to a DTO
    return arr.map((e) => this.entityToDto(e));
  }

  /**
   * Retrieves a single article by its unique identifier.
   *
   * @param {number} id - The unique identifier of the article to retrieve.
   * @return {Promise<ReturnArticleDto>} A promise resolving to the article data transfer object if the article is found.
   * @throws {NotFoundException} If no article is found with the provided identifier.
   */
  async findOne(id: number): Promise<ReturnArticleDto> {
    const findEntity = await this.repo.findOneBy({ id });
    if (!findEntity) throw new NotFoundException(`Article ${id} not found`);
    return this.entityToDto(findEntity);
  }

  /**
   * Replaces an existing article with new data by validating its version and ID.
   *
   * @param {number} userId - The ID of the user performing the replacement.
   * @param {number} id - The ID of the article to be replaced.
   * @param {ReplaceArticleDto} replaceDto - The data transfer object containing the new article data.
   * @return {Promise<ReturnArticleDto>} A promise that resolves to the updated article's data transfer object.
   * @throws {NotFoundException} If the specified article is not found.
   * @throws {ConflictException} If the article's ID or version does not match the expected values.
   */
  async replace(
    userId: number,
    id: number,
    replaceDto: ReplaceArticleDto,
  ): Promise<ReturnArticleDto> {
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) throw new NotFoundException(`Article ${id} not found`);
    // check the version
    if (existingEntity.version !== replaceDto.version) {
      throw new ConflictException(
        `Article ${id} version mismatch. Expected ${existingEntity.id} got ${replaceDto.version}`,
      );
    }
    if (existingEntity.id !== replaceDto.id) {
      throw new ConflictException(
        `Article id mismatch. Expected ${existingEntity.id} got ${replaceDto.id}`,
      );
    }
    const replacedEntity = await this.repo.save({
      ...existingEntity,
      ...replaceDto,
      updatedById: userId,
      id,
    });
    return this.entityToDto(replacedEntity);
  }

  /**
   * Updates an article identified by its ID with new data provided in the updateArticleDto object.
   *
   * @param {number} userId - The ID of the user performing the update.
   * @param {number} id - The ID of the article to be updated.
   * @param {UpdateArticleDto} updateArticleDto - An object containing the properties to update in the article.
   * @return {Promise<ReturnArticleDto>} A promise that resolves to the updated article data in the form of a ReturnArticleDto object.
   * @throws {NotFoundException} Throws if the article with the specified ID is not found.
   */
  async update(
    userId: number,
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ReturnArticleDto> {
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) throw new NotFoundException(`Article ${id} not found`);
    const updatedEntity = await this.repo.save({
      ...existingEntity,
      ...updateArticleDto,
      updatedById: userId,
      id,
    });
    return this.entityToDto(updatedEntity);
  }

  /**
   * Removes an article by its identifier.
   *
   * @param {number} id - The unique identifier of the article to remove.
   * @return {Promise<ReturnArticleDto>} A promise that resolves to the DTO of the removed article.
   * @throws {NotFoundException} Thrown if the article with the given identifier is not found.
   */
  async remove(id: number): Promise<ReturnArticleDto> {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) throw new NotFoundException(`Article ${id} not found`);
    await this.repo.remove(existing);
    return this.entityToDto(existing);
  }
  // endregion public methods
}
