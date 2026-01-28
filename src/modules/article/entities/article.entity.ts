// src/modules/article/entities/article.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Represents the entity for an article in the database.
 * It maps to the 'article' table and defines the structure of the data stored.
 *
 * The entity includes properties for the article's unique identifier, name, description, price,
 * metadata for creation and modification timestamps, versioning, and user tracking for creation
 * and updates.
 *
 * Decorators are used to specify the database column type, constraints, and behavior.
 * Special handling for the 'articlePrice' column ensures compatibility with PostgreSQL.
 *
 * This class is used with ORM frameworks such as TypeORM to manage the persistence
 * and retrieval of article records within the database.
 */
// wir können hier den Tabellennamen in der Datenbank definieren
@Entity('article')
export class ArticleEntity {
  // wir definieren, dass es eine automatisch generierte ID gibt. Automatisch auch unique
  /**
   * Represents a unique identifier for an entity.
   * This variable is mandatory, and its value cannot be null or undefined.
   */
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  articleName!: string;

  @Column({ type: 'varchar' })
  articleDescription!: string;

  // hint: Wir haben den Datentyp angepasst, da double ein Problem mit postgres hat
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  articlePrice!: number;

  /**
   * Represents the date and time when an entity was created.
   *
   * This variable stores a Date object that indicates the timestamp
   * at which the associated entity or record was initially created.
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Represents the date and time when the entity was last updated.
   * This variable stores a Date object indicating the most recent modification timestamp.
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Represents the version number of the application or module.
   * This variable is used to track and identify the current version.
   */
  @VersionColumn()
  version: number;

  /**
   * Represents the unique identifier of the user who created a particular entity.
   * This is typically used to track the creator of a record or resource.
   * Be aware that we give a different name to the column in the database to avoid conflicts with other columns.
   */
  @Column({ type: 'int', name: 'created_by_id' })
  createdById: number;

  @Column({ type: 'int', name: 'update_by_id' })
  updatedById: number;
}
