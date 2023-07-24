import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  table: string;

  @Column({ type: 'enum', enum: ['created', 'updated', 'removed'] })
  action: 'created' | 'updated' | 'removed';

  @Column({ type: 'int' })
  ref_id: number;

  @Column({ type: 'int' })
  moderator_id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'removed'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'removed';

  @Column({ type: 'varchar', length: 255, nullable: true })
  action_message: string;
}
