import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { UserPaginationDto } from './dto/pagination.dto';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    req: RequestWithUser,
  ): Promise<User | Error> {
    const isExist = await this.findByUsername(createUserDto.username);

    if (isExist) {
      throw Error('Username has already taken');
    }
    const { password, ...rest } = createUserDto;
    const hashedPassword = await this.hashPassword(password);
    const newUser = await this.userRepository.create({
      password: hashedPassword,
      ...rest,
    });
    newUser.moderator_id = req.user.id;
    return await this.userRepository.save(newUser);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async findAll(query?: UserPaginationDto): Promise<PaginationResponse> {
    const total = await this.userRepository.count();
    const result = await this.userRepository.find({
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

  async findOne(id: number, detail = false): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    req: RequestWithUser,
  ): Promise<UpdateResult> {
    const user = await this.userRepository.findOne({ where: { id } });
    return await this.userRepository.update(id, {
      id: id,
      moderator_id: req.user.id,
      ...updateUserDto,
    });
  }

  async remove(id: number, req: RequestWithUser): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.moderator_id = req.user.id;
    return await this.userRepository.remove(user);
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    userId: number,
  ): Promise<void> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken: currentHashedRefreshToken,
      id: userId,
      moderator_id: userId,
    });
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<boolean> {
    const user = await this.findOne(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return true;
    }
  }

  async removeRefreshToken(userId: number): Promise<UpdateResult> {
    return await this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
      moderator_id: userId,
      id: userId,
      action_message: 'User logged out',
    });
  }
}
