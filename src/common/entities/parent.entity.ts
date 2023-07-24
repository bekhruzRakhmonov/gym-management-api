import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class ParentEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  moderator_id: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'removed'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'removed';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  action_message: string;

  @ManyToOne(() => User, (user: User) => user)
  @JoinColumn({ name: 'moderator_id', referencedColumnName: 'moderator_id' })
  moderator: User;
}
