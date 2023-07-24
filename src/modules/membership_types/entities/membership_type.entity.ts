import { ParentEntity } from 'src/common/entities/parent.entity';
import { Membership } from 'src/modules/membership/entities/membership.entity';
import { Term } from 'src/modules/membership_types/enums/term.enum';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Column, Entity, ManyToMany, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class MembershipType extends ParentEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 4,
    nullable: false,
  })
  price: number;

  @Column({ type: 'enum', enum: Term })
  term: Term;

  @OneToMany(
    () => Membership,
    (membership: Membership) => membership.membership_type,
  )
  membership: Membership[];
}
