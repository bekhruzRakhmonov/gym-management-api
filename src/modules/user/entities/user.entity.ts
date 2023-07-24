import { Exclude } from 'class-transformer';
import { ParentEntity } from 'src/common/entities/parent.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Visit } from 'src/modules/visit/entities/visit.entity';

@Entity('users')
export class User extends ParentEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: ['manager', 'admin'] })
  role: 'manager' | 'admin';

  @Column({ type: 'varchar', length: 255 })
  fullname: string;

  @Column({ type: 'varchar', length: 255 })
  phone: string;

  @Column('varchar', { nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @OneToMany(() => Visit, (visit: Visit) => visit.moderator)
  visits: Visit[];

  toString() {
    return 'User';
  }
}
