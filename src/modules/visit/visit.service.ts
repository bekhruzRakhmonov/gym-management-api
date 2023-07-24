import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/modules/member/entities/member.entity';
import { Repository, UpdateResult } from 'typeorm';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { Visit } from './entities/visit.entity';
import { VisitPaginationDto } from './dto/pagination.dto';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { User } from '../user/entities/user.entity';
import * as moment from 'moment';
moment.locale('UZ');

@Injectable()
export class VisitService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async checkIn(
    createVisitDto: CreateVisitDto,
    moderator_id: number,
  ): Promise<any> {
    const { member_id } = createVisitDto;
    const member = await this.memberRepo.findOne({
      where: { id: member_id },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    moment;
    const memberVisit = await this.visitRepo.findOne({
      order: { id: 'DESC' },
      where: {
        member: {
          id: member_id,
        },
      },
    });
    if (memberVisit) {
      // const dateTimeFormatter = new Intl.DateTimeFormat('uz-UZ', {
      //   year: 'numeric',
      //   hour: 'numeric',
      //   minute: 'numeric',
      //   second: 'numeric',
      //   day: '2-digit',
      //   month: '2-digit',
      // });
      memberVisit.created_at.setTime(
        memberVisit.created_at.getTimezoneOffset() * -1 * 1000 * 60 +
          memberVisit.created_at.getTime(),
      );
      const curHour = memberVisit.created_at.getHours() + 2;
      memberVisit.created_at.setHours(curHour);
      const checkedIn =
        memberVisit.created_at < new Date(today.getTime() + 86400000);
      if (checkedIn) {
        throw new BadRequestException('Already checked in');
      }
    }
    const user = await this.userRepo.findOne({
      where: {
        id: moderator_id,
      },
    });
    const newVisit = this.visitRepo.create({ member });
    newVisit.moderator_id = moderator_id;
    newVisit.checked_in_by = user.role;
    return await this.visitRepo.save(newVisit);
  }

  async findAll(query?: VisitPaginationDto): Promise<PaginationResponse> {
    const total = await this.visitRepo.count({
      where: {
        created_at: query?.date,
      },
    });
    let result = await this.visitRepo.find({
      where: {
        created_at: query?.date,
      },
      relations: { member: true, moderator: true },
      order: { id: 'DESC' },
      skip: (query?.limit || 10) * ((query.page || 1) - 1),
      take: query?.limit || 10,
    });

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findOne(id: number): Promise<Visit> {
    return await this.visitRepo.findOne({
      where: { id },
      relations: {
        member: true,
        moderator: true,
      },
    });
  }

  async update(
    id: number,
    updateVisitDto: UpdateVisitDto,
    moderator_id: number,
  ): Promise<UpdateResult> {
    const { member_id, ...rest } = updateVisitDto;
    const member = await this.memberRepo.findOne({
      where: { id: member_id },
    });
    if (!member) {
      throw new NotFoundException('Membership Type not found.');
    }
    return await this.visitRepo.update(id, {
      member,
      ...rest,
      moderator_id,
      id: id,
    });
  }

  async remove(id: number, moderator_id: number): Promise<Visit> {
    const visit = await this.visitRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }
    visit.moderator_id = moderator_id;
    return await this.visitRepo.remove(visit);
  }
}
