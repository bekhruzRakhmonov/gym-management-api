import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembershipType } from 'src/modules/membership_types/entities/membership_type.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { MembershipPaginationDto } from './dto/pagination.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { Membership } from './entities/membership.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { Member } from '../member/entities/member.entity';
import { Term } from '../membership_types/enums/term.enum';
import { Payment } from '../payment/entities/payment.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(MembershipType)
    private readonly membershipTypeRepo: Repository<MembershipType>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}
  async create(
    createMembershipDto: CreateMembershipDto,
    moderator_id: number,
  ): Promise<any> {
    try {
      const { membership_type_id, member_id, start_date, payment_method } =
        createMembershipDto;
      const membership_type = await this.membershipTypeRepo.findOne({
        where: { id: membership_type_id },
      });
      if (!membership_type) {
        throw new NotFoundException('MembershipType not found');
      }

      const member = await this.memberRepo.findOne({
        where: {
          id: member_id,
        },
        relations: {
          memberships: true,
        },
      });
      if (!member) {
        throw new NotFoundException('Member not found');
      }
      const options = { timeZone: 'Asia/Tashkent' };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const formattedDate = formatter.format(start_date);
      let end_date: Date = new Date(formattedDate);
      switch (membership_type.term) {
        case Term.OneDay:
          end_date.setDate(start_date.getDate() + 1);
          break;
        case Term.FiftenDay:
          end_date.setDate(start_date.getDate() + 15);
          break;
        case Term.OneMonth:
          end_date.setMonth(start_date.getMonth() + 1);
          break;
        case Term.TwoMonth:
          end_date.setMonth(start_date.getMonth() + 2);
          break;
        case Term.ThreeMonth:
          end_date.setMonth(start_date.getMonth() + 3);
          break;
        case Term.FourMonth:
          end_date.setMonth(start_date.getMonth() + 4);
          break;
        case Term.FiveMonth:
          end_date.setMonth(start_date.getMonth() + 5);
          break;
        case Term.SixMonth:
          end_date.setMonth(start_date.getMonth() + 6);
          break;
      }

      const newMembership = this.membershipRepo.create({
        membership_type,
        start_date,
        end_date,
      });

      if (member.memberships) {
        for (const membship of member.memberships) {
          membship.status = 'inactive';
          await membship.save();
        }
      }

      newMembership.moderator_id = moderator_id;
      newMembership.member = member;
      const newPayment = this.paymentRepo.create({
        moderator_id,
        member,
        for_what: 'membership',
        total: membership_type.price,
        payment_method,
        paid_status: 'paid',
        membership: newMembership,
      });
      const payment = await this.paymentRepo.save(newPayment);
      newMembership.payment = payment;
      await this.membershipRepo.save(newMembership);
      return await this.findOne(newMembership.id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(query?: MembershipPaginationDto): Promise<PaginationResponse> {
    const total = await this.membershipRepo.count({
      where: {
        status: query?.status,
        start_date: query?.start_date,
        end_date: query?.end_date,
      },
    });
    const result = await this.membershipRepo
      .createQueryBuilder('membership')
      .leftJoin(
        'membership.membership_type',
        'membership_type',
        'membership.membershipTypeId = membership_type.id',
      )
      .leftJoin(
        'membership.payment',
        'payment',
        'payment.id = membership.paymentId',
      )
      .select('membership.id', 'id')
      .addSelect('membership.status', 'status')
      .addSelect('membership.start_date', 'start_date')
      .addSelect('membership.end_date', 'end_date')
      .addSelect('membership.memberId', 'member_id')
      .addSelect('membership_type.term', 'term')
      .addSelect('membership_type.price', 'price')
      .addSelect('payment.payment_method', 'payment_method')
      .where('membership.status IN (:statuses)', {
        statuses: ['active', 'inactive'],
      })
      .offset((query?.limit || 10) * ((query?.page || 1) - 1))
      .orderBy('membership.id', 'DESC')
      .limit(query?.limit || 10)
      .getRawMany();

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findOne(id: number): Promise<Membership> {
    return await this.membershipRepo.findOne({
      where: { id },
      select: {
        payment: {
          payment_method: true,
        },
      },
      relations: { member: true, membership_type: true, payment: true },
    });
  }

  async update(
    id: number,
    updateMembershipDto: UpdateMembershipDto,
    moderator_id: number,
  ): Promise<Membership> {
    const { membership_type_id, payment_method, ...rest } = updateMembershipDto;
    const membership_type = await this.membershipTypeRepo.findOne({
      where: { id: membership_type_id },
    });
    if (!membership_type) {
      throw new NotFoundException('Membership Type not found.');
    }
    const membership = await this.membershipRepo.findOne({
      relations: {
        payment: true,
      },
      where: { id, status: 'active' || 'inactive' },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }
    if (payment_method) {
      const payment = membership.payment;
      payment.payment_method = payment_method;
      await payment.save();
    }

    await this.membershipRepo.update(id, {
      membership_type,
      ...rest,
      moderator_id,
      id: id,
    });
    return await this.membershipRepo.findOneBy({ id });
  }

  async remove(id: number, moderator_id: number): Promise<Membership> {
    const membership = await this.membershipRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    return await this.membershipRepo.remove(membership);
  }
}
