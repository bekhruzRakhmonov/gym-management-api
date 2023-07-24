import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { APIResponse } from 'src/common/http/response/response.api';
import { Query, Req, UseGuards } from '@nestjs/common/decorators';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { Role } from 'src/modules/auth/roles/role.enum';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { UserPaginationDto } from './dto/pagination.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const userCreated = await this.userService.create(createUserDto, req);
      return APIResponse(res).statusCreated(userCreated);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  @Get()
  async findAll(
    @Res() res: Response,
    @Req() req: RequestWithUser,
    @Query() query: UserPaginationDto,
  ): Promise<ResponseInterface | Error> {
    try {
      const users = await this.userService.findAll(query);
      return APIResponse(res).statusOK(users);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<any | Error> {
    try {
      const updatedUser = await this.userService.update(
        +id,
        updateUserDto,
        req,
      );
      return APIResponse(res).statusOK(updatedUser);
    } catch (error) {
      throw error;
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const deletedUser = await this.userService.remove(+id, req);
      return APIResponse(res).statusOK(deletedUser);
    } catch (error) {
      throw error;
    }
  }
}
