import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Membership } from '../membership/entities/membership.entity';
import { Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberPaginationDto } from './dto/pagination.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities/member.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { MembershipType } from '../membership_types/entities/membership_type.entity';
import { Payment } from '../payment/entities/payment.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}
  async create(
    createMemberDto: CreateMemberDto,
    moderator_id: number,
  ): Promise<Member> {
    const { phone, ...rest } = createMemberDto;
    const isPhoneExist = await this.memberRepo.findOne({
      where: {
        phone: phone,
        status: 'active',
      },
    });
    if (isPhoneExist) {
      throw new BadRequestException('Phone number already exist.');
    }
    const newMember = this.memberRepo.create({
      phone,
      ...rest,
    });
    newMember.moderator_id = moderator_id;
    return await this.memberRepo.save(newMember);
  }

  async findAll(query?: MemberPaginationDto): Promise<PaginationResponse> {
    const total = await this.memberRepo
      .createQueryBuilder('member')
      .where('member.status IN (:statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('(member.fullname LIKE :q OR member.phone LIKE :q)')
      .setParameter('q', `%${query?.q || ''}%`)
      .getCount();
    const result = await this.memberRepo
      .createQueryBuilder('member')
      .leftJoin(
        'member.memberships',
        'memberships',
        'memberships.memberId = member.id AND memberships.status = :status',
        { status: 'active' },
      )
      .leftJoin(
        'memberships.membership_type',
        'membership_type',
        'memberships.membershipTypeId = membership_type.id',
      )
      .where('member.status IN (:statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('(member.fullname LIKE :q OR member.phone LIKE :q)', {
        q: `%${query?.q || ''}%`,
      })
      .select('member.id', 'id')
      .addSelect('member.moderator_id', 'moderator_id')
      .addSelect('member.status', 'status')
      .addSelect('member.created_at', 'created_at')
      .addSelect('member.fullname', 'fullname')
      .addSelect('member.phone', 'phone')
      .addSelect('member.gender', 'gender')
      .addSelect('member.date_of_birth', 'date_of_birth')
      .addSelect('memberships.end_date', 'end_date')
      .addSelect('membership_type.name', 'membership_type')
      .orderBy('id', 'DESC')
      .offset((query?.page - 1 || 0) * (query?.limit || 10))
      .limit(query?.limit || 10)
      .groupBy('member.id')
      .getRawMany();

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findAllVisits(query?: MemberPaginationDto) {
    const total = await this.memberRepo.count();
    const result = await this.memberRepo.find({
      relations: {
        visit: true,
      },
      order: { created_at: 'DESC' },
      skip: (query?.limit || 10) * ((query?.page || 1) - 1),
      take: query?.limit || 10,
    });

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findAllMemberships(query?: MemberPaginationDto) {
    const total = await this.memberRepo.count();
    const result = await this.memberRepo.find({
      relations: {
        memberships: {
          membership_type: true,
        },
      },
      order: { created_at: 'DESC' },
      skip: (query?.limit || 10) * ((query?.page || 1) - 1),
      take: query?.limit || 10,
    });

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findAllPayments(query?: MemberPaginationDto) {
    const total = await this.memberRepo.count();
    const result = await this.memberRepo.find({
      relations: {
        payments: true,
      },
      order: { created_at: 'DESC' },
      skip: (query?.limit || 10) * ((query?.page || 1) - 1),
      take: query?.limit || 10,
    });

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findOne(id: number, detail = true): Promise<Member> {
    return await this.memberRepo.findOne({
      where: { id },
      relations: { visit: detail, memberships: detail, payments: detail },
    });
  }

  async findOneMemberships(id: number): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: {
        id,
      },
      relations: {
        memberships: {
          membership_type: true,
        },
      },
      order: {
        memberships: {
          id: 'DESC',
        },
      },
    });
    for (const membership of member.memberships) {
      const payment = await this.paymentRepo.findOne({
        where: {
          membership: { id: membership.id },
        },
      });
      membership['payment_method'] = payment.payment_method;
    }
    return member;
  }

  async update(
    id: number,
    updateMemberDto: UpdateMemberDto,
    moderator_id: number,
  ): Promise<Member> {
    const { membership_id, ...rest } = updateMemberDto;
    const member = await this.memberRepo.findOne({
      where: { id },
      relations: {
        memberships: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found.');
    }
    if (membership_id) {
      const membership = await this.membershipRepo.findOne({
        where: { id: membership_id, status: 'active' },
      });
      if (!membership) {
        throw new NotFoundException('Membership not found.');
      }

      for (const membship of member.memberships) {
        membship.status = 'inactive';
        await membship.save();
      }
      member.memberships.push(membership);
      member.moderator_id = moderator_id;
      member.id = id;
      member.action_message = 'Memberhip added';
    }
    for (const key in rest) {
      member[key] = rest[key];
    }
    return await member.save();
  }

  async remove(id: number, moderator_id: number): Promise<Member> {
    const member = await this.memberRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    member.moderator_id = moderator_id;
    return await this.memberRepo.remove(member);
  }
}
