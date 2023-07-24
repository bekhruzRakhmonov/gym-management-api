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
import { MembershipService } from './membership.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Response } from 'express';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { APIResponse } from 'src/common/http/response/response.api';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { MembershipPaginationDto } from './dto/pagination.dto';

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createMembershipDto: CreateMembershipDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const createdMembership = await this.membershipService.create(
        createMembershipDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdMembership);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() query: MembershipPaginationDto,
    @Res() res: Response,
  ): Promise<ResponseInterface> {
    try {
      const foundMemberships = await this.membershipService.findAll(query);
      return APIResponse(res).statusOK(foundMemberships);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<ResponseInterface> {
    try {
      const foundMembership = await this.membershipService.findOne(+id);
      return APIResponse(res).statusOK(foundMembership);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const updatedMembership = await this.membershipService.update(
        +id,
        updateMembershipDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedMembership);
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
      const deletedMembership = await this.membershipService.remove(
        +id,
        req.user.id,
      );
      return APIResponse(res).statusOK(deletedMembership);
    } catch (error) {
      throw error;
    }
  }
}
