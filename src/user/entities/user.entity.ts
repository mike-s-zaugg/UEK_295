import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 20 })
    username: string;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column({ default: false })
    isAdmin: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: 1 })
    version: number;

    @Column({ nullable: true })
    createdById: number;

    @Column({ nullable: true })
    updatedById: number;
}