import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { dataSource } from 'src/common/database/app-data-source';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { ActivityPaginationDto } from './dto/pagination.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}
  async findAll(query?: ActivityPaginationDto) {
    const manager = await dataSource;
    const total = await manager
      .getRepository(Activity)
      .createQueryBuilder('activity')
      .select('activity.id', 'id')
      .innerJoin(User, 'user', 'user.id = activity.moderator_id')
      .getCount();

    const result = await manager
      .getRepository(Activity)
      .createQueryBuilder('activity')
      .select('activity.id', 'id')
      .addSelect('activity.table', 'table')
      .addSelect('activity.action', 'action')
      .addSelect('activity.ref_id', 'ref_id')
      .addSelect('activity.action_message', 'action_message')
      .addSelect('activity.created_at', 'date')
      .addSelect('activity.moderator_id', 'moderator_id')
      .innerJoin(User, 'user', 'user.id = activity.moderator_id')
      .addSelect('user.fullname', 'moderator_fullname')
      .addSelect('user.username', 'moderator_username')
      .addSelect('user.phone', 'moderator_phone')
      .orderBy('activity.created_at', 'DESC')
      .offset((query?.limit || 10) * ((query?.page || 1) - 1))
      .limit(query?.limit || 10)
      .getRawMany();

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findOne(id: number) {
    return await this.activityRepo.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
    moderator_id: number,
  ): Promise<UpdateResult> {
    return await this.activityRepo.update(id, {
      ...updateActivityDto,
      moderator_id,
      id,
    });
  }

  async remove(id: number, moderator_id: number) {
    const activity = await this.activityRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    activity.moderator_id = moderator_id;
    return this.activityRepo.remove(activity);
  }
}
