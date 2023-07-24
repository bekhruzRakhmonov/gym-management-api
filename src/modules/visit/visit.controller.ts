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
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { Response } from 'express';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { APIResponse } from 'src/common/http/response/response.api';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { VisitPaginationDto } from './dto/pagination.dto';
import { CheckOutDto } from './dto/check-out.dto';

@ApiTags('visit')
@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('check-in')
  async sendVerificationCode(
    @Body() createVisitDto: CreateVisitDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const sent = await this.visitService.checkIn(createVisitDto, req.user.id);
      return APIResponse(res).statusOK(sent);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() query: VisitPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const visits = await this.visitService.findAll(query);
      return APIResponse(res).statusOK(visits);
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
      const visit = await this.visitService.findOne(+id);
      return APIResponse(res).statusOK(visit);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const updatedVisit = this.visitService.update(
        +id,
        updateVisitDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedVisit);
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
      const deletedVisit = await this.visitService.remove(+id, req.user.id);
      return APIResponse(res).statusOK(deletedVisit);
    } catch (error) {
      throw error;
    }
  }
}
