import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ApiTags } from '@nestjs/swagger';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { APIResponse } from 'src/common/http/response/response.api';
import { Response } from 'express';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { MemberPaginationDto } from './dto/pagination.dto';

@ApiTags('member')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createMemberDto: CreateMemberDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    try {
      const createdMember = await this.memberService.create(
        createMemberDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdMember);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('list')
  async findAll(
    @Query() query: MemberPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const foundMembers = await this.memberService.findAll(query);
      return APIResponse(res).statusOK(foundMembers);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('visits')
  async findAllVisits(
    @Query() query: MemberPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const foundMemberVisists = await this.memberService.findAllVisits(query);
      return APIResponse(res).statusOK(foundMemberVisists);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('memberships')
  async findAllMemberships(
    @Query() query: MemberPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const foundMemberMemberships =
        await this.memberService.findAllMemberships(query);
      return APIResponse(res).statusOK(foundMemberMemberships);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('payments')
  async findAllPayments(
    @Query() query: MemberPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const foundMemberPayments = await this.memberService.findAllPayments(
        query,
      );
      return APIResponse(res).statusOK(foundMemberPayments);
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
      const foundMember = await this.memberService.findOne(+id);
      return APIResponse(res).statusOK(foundMember);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/memberships')
  async findOneMemberships(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const foundMember = await this.memberService.findOneMemberships(+id);
      return APIResponse(res).statusOK(foundMember);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const updatedMember = await this.memberService.update(
        +id,
        updateMemberDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedMember);
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
  ) {
    try {
      const deletedMember = await this.memberService.remove(+id, req.user.id);
      return APIResponse(res).statusOK(deletedMember);
    } catch (error) {
      throw error;
    }
  }
}
