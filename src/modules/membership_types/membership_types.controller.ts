import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { MembershipTypesService } from './membership_types.service';
import { CreateMembershipTypeDto } from './dto/create-membership_type.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership_type.dto';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { APIResponse } from 'src/common/http/response/response.api';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { Response } from 'express';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { MembershipTypePaginationDto } from './dto/pagination.dto';

@ApiTags('membership-types')
@Controller('membership-types')
export class MembershipTypesController {
  constructor(
    private readonly membershipTypesService: MembershipTypesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body()
    createMembershipTypeDto: CreateMembershipTypeDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const createdMembershipType = await this.membershipTypesService.create(
        createMembershipTypeDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdMembershipType);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() query: MembershipTypePaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const membershipTypes = await this.membershipTypesService.findAll(query);
      return APIResponse(res).statusOK(membershipTypes);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const membershipType = await this.membershipTypesService.findOne(+id);
      return APIResponse(res).statusOK(membershipType);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateMembershipTypeDto: UpdateMembershipTypeDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const updatedMembershipType = await this.membershipTypesService.update(
        +id,
        updateMembershipTypeDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedMembershipType);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const deletedMembershipType = await this.membershipTypesService.remove(
        +id,
        req.user.id,
      );
      return APIResponse(res).statusOK(deletedMembershipType);
    } catch (error) {
      throw error;
    }
  }
}
