// src/modules/auth/seed/user-seed.service.ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from '../services/password.service';
import { UserEntity } from '../entities/user.entity';

/**
 * A service responsible for seeding initial user data into the database during application bootstrap.
 * This service ensures the creation of predefined user accounts.
 */
@Injectable()
export class UserSeedService implements OnApplicationBootstrap {
  /**
   * Logger instance used for logging messages related to the UserSeedService.
   *
   * Initialized with the name of the service to provide context-specific logging
   * for debugging and monitoring purposes.
   *
   * @type {Logger}
   */

  private readonly logger: Logger = new Logger(UserSeedService.name);
  /**
   * Initializes a new instance of the class with the specified data source and password service.
   *
   * @param {DataSource} dataSource The data source to be used for operations.
   * @param {PasswordService} passwordService The service responsible for handling password-related functionality.
   */
  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Handles logic that should be executed when the application finishes bootstrapping.
   * Typically used for initializing resources or seeding the database.
   *
   * @return {Promise<void>} A promise that resolves once the bootstrap logic is complete.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  /**
   * Seeds the database with initial user data.
   *
   * This method populates the database with predefined user records:
   * - An administrator user with ID 1, `isAdmin` set to true, and a predefined password.
   * - A standard user with ID 2, `isAdmin` set to false, and a predefined password.
   * The method uses the provided repository to insert or update these records.
   *
   * @return {Promise<void>} A promise that resolves when the seeding process is complete.
   */
  async seed(): Promise<void> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    this.logger.debug(`${this.seed.name}: start`);

    // exakt dein Verhalten:
    // - admin -> id=1, isAdmin=true, password="admin"
    // - user  -> id=2, isAdmin=false, password="user"
    await this.upsertById(userRepo, 1, 'admin', true);
    await this.upsertById(userRepo, 2, 'user', false);
  }

  /**
   * Inserts or updates a user record by its ID. If the record already exists, no action is performed.
   *
   * @param {Repository<UserEntity>} userRepo - The user repository instance for performing database operations.
   * @param {number} id - The unique identifier of the user.
   * @param {string} username - The username of the user.
   * @param {boolean} isAdmin - A flag indicating whether the user has administrative privileges.
   * @param {string} [password=username] - The password for the user. Defaults to the provided username if not specified.
   * @return {Promise<void>} A promise that resolves when the insert or update operation is complete.
   */
  private async upsertById(
    userRepo: Repository<UserEntity>,
    id: number,
    username: string,
    isAdmin: boolean,
    password: string = username,
  ): Promise<void> {
    this.logger.verbose(
      `${this.upsertById.name}: id=${id}, username=${username}, isAdmin=${isAdmin}, password=${password}`,
    );
    const existing = await userRepo.findOneBy({ id });
    if (existing) return;

    await userRepo.upsert(
      {
        id,
        username: username.toLowerCase(),
        email: `${username}@local.ch`.toLowerCase(),
        isAdmin: isAdmin,
        passwordHash: await this.passwordService.hashPassword(0, password),
        createdById: 0,
        updatedById: 0,
      },
      ['id'],
    );
  }
}
