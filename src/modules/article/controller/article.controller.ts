// modules/article/controller/article.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from '../service/article.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { UserId } from '../../auth/decorators';
import { ReplaceArticleDto } from '../dto/replace-article.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReturnArticleDto } from '../dto/return-article.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';

/**
 * Controller for managing operations related to articles.
 *
 * This controller provides endpoints for creating, retrieving, updating, and deleting articles.
 * Authentication is required for all operations as the controller is guarded.
 */
@Controller('article')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // region create a resource
  /**
   * Creates a new article resource.
   *
   * @param {number} userId - The ID of the user creating the article.
   * @param {CreateArticleDto} createArticleDto - The data transfer object containing the article details.
   * @return {Promise<ReturnArticleDto>} A promise resolving to the created article resource.
   */
  @Post()
  @ApiOperation({
    summary: 'Create article',
    description: 'Create a new article resource.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    type: ReturnArticleDto,
    description:
      'Return the created article resource\n\n[Referenz zu HTTP 201](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/201)',
  })
  @ApiBody({ type: CreateArticleDto })
  create(
    @UserId() userId: number,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ReturnArticleDto> {
    return this.articleService.create(userId, createArticleDto);
  }
  // endregion create a resource

  // region find all resources
  /**
   * Retrieves all article resources.
   *
   * @return {Promise<ReturnArticleDto[]>} A promise that resolves to an array of found article resources.
   */
  @Get()
  @ApiOperation({
    summary: 'Get all article',
    description: 'Return an array of article resources.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the found article resource array\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
    isArray: true,
  })
  findAll(): Promise<ReturnArticleDto[]> {
    return this.articleService.findAll();
  }
  // endregion findAll resources

  // region find one resource
  /**
   * Fetches a single article resource by its unique identifier.
   *
   * @param {string} id - The unique identifier of the article to be retrieved.
   * @return {Promise<ReturnArticleDto>} The article resource matching the given id.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get article by id',
    description: `Return a article resource by it's id.`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the found article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string): Promise<ReturnArticleDto> {
    return this.articleService.findOne(+id);
  }
  // endregion find one resource

  //region replace a resource
  /**
   * Replaces an existing article resource with new values by its ID.
   *
   * @param {number} userId - The ID of the user performing the operation.
   * @param {number} id - The ID of the article to be replaced.
   * @param {ReplaceArticleDto} replaceDto - The data transfer object containing the new values for the article.
   * @return {Promise<ReturnArticleDto>} The replaced article resource.
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Replace article',
    description: `Replace a article resource by id with new values and return the replaced resource.`,
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the replaced article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiConflictResponse({
    description:
      'The article version mismatch\n\n[Referenz zu HTTP 409](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/409)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: ReplaceArticleDto })
  replace(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() replaceDto: ReplaceArticleDto,
  ): Promise<ReturnArticleDto> {
    return this.articleService.replace(userId, id, replaceDto);
  }
  // endregion replace a resource

  // region partial update a resource
  /**
   * Updates an article resource by its ID with new values and returns the updated resource.
   *
   * @param {number} userId - The ID of the authenticated user making the request.
   * @param {number} id - The ID of the article to be updated.
   * @param {UpdateArticleDto} updateArticleDto - The data transfer object containing the new values for the article.
   * @return {Promise<ReturnArticleDto>} The updated article resource.
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update article',
    description: `Update a article resource by id with new values and return the updated resource.`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the updated article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateArticleDto })
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ReturnArticleDto> {
    return this.articleService.update(userId, id, updateArticleDto);
  }
  // endregion partial update a resource

  // region delete a resource
  /**
   * Deletes an article by its unique identifier.
   *
   * @param {string} id - The unique identifier of the article to be deleted.
   * @return {Promise<ReturnArticleDto>} The deleted article resource.
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete article',
    description: `Delete a article by id and return the deleted object.`,
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized\n\n[Referenz zu HTTP 401](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/401)',
  })
  @ApiOkResponse({
    type: ReturnArticleDto,
    description:
      'Return the deleted article resource\n\n[Referenz zu HTTP 200](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/200)',
  })
  @ApiNotFoundResponse({
    description:
      'The article was not found with the requested id\n\n[Referenz zu HTTP 404](https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status/404)',
  })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string): Promise<ReturnArticleDto> {
    return this.articleService.remove(+id);
  }
  // endregion delete a resource
}
