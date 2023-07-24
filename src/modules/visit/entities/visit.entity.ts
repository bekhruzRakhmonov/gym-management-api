import { ParentEntity } from 'src/common/entities/parent.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Visit extends ParentEntity {
  @ManyToOne(() => Member, (member: Member) => member.visit)
  @JoinColumn()
  member: Member;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'enum', enum: ['manager', 'admin'] })
  checked_in_by: 'manager' | 'admin';

  toString() {
    return 'Visit';
  }
}
