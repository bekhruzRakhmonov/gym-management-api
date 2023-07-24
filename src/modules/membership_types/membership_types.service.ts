import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, UpdateResult } from 'typeorm';
import { CreateMembershipTypeDto } from './dto/create-membership_type.dto';
import { MembershipTypePaginationDto } from './dto/pagination.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership_type.dto';
import { MembershipType } from './entities/membership_type.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';

@Injectable()
export class MembershipTypesService {
  constructor(
    @InjectRepository(MembershipType)
    private readonly membershipTypeRepo: Repository<MembershipType>,
  ) {}
  async create(
    createMembershipTypeDto: CreateMembershipTypeDto,
    moderator_id: number,
  ): Promise<MembershipType> {
    const { name, price, term } = createMembershipTypeDto;
    const newMembershipType = this.membershipTypeRepo.create({
      name,
      price,
      term,
    });
    newMembershipType.moderator_id = moderator_id;
    return await this.membershipTypeRepo.save(newMembershipType);
  }

  async findAll(
    query?: MembershipTypePaginationDto,
  ): Promise<PaginationResponse> {
    const total = await this.membershipTypeRepo.count();
    const result = await this.membershipTypeRepo.find({
      where: {
        status: Not('removed'),
      },
      order: { id: 'DESC' },
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

  async findOne(id: number): Promise<MembershipType> {
    return await this.membershipTypeRepo.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateMembershipTypeDto: UpdateMembershipTypeDto,
    moderator_id: number,
  ): Promise<MembershipType> {
    await this.membershipTypeRepo.update(id, {
      ...updateMembershipTypeDto,
      moderator_id,
      id: id,
    });
    return await this.membershipTypeRepo.findOneBy({ id });
  }

  async remove(id: number, moderator_id: number): Promise<MembershipType> {
    const membershipType = await this.membershipTypeRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!membershipType) {
      throw new NotFoundException('MembershipType not found');
    }
    membershipType.moderator_id = moderator_id;
    return await this.membershipTypeRepo.remove(membershipType);
  }
}
