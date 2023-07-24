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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Response } from 'express';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { APIResponse } from 'src/common/http/response/response.api';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { PaymentPaginationDto } from './dto/pagination.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/role.enum';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface | Error> {
    try {
      const createdPayment = await this.paymentService.create(
        createPaymentDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdPayment);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin)
  @Get()
  async findAll(
    @Query() query: PaymentPaginationDto,
    @Res() res: Response,
  ): Promise<ResponseInterface | Error> {
    try {
      const payments = await this.paymentService.findAll(query);
      return APIResponse(res).statusOK(payments);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Manager, Role.Admin)
  @Get('details/:id')
  async findAllPaymentDetailsById(
    @Param('id') id: string,
    @Query() query: PaymentPaginationDto,
    @Res() res: Response,
  ): Promise<ResponseInterface | Error> {
    try {
      console.log(id);
      const paymentDetails =
        await this.paymentService.findAllPaymentDetailsById(query, +id);
      return APIResponse(res).statusOK(paymentDetails);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<ResponseInterface | Error> {
    try {
      const payment = await this.paymentService.findOne(+id);
      return APIResponse(res).statusOK(payment);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface | Error> {
    try {
      const updatedPayment = await this.paymentService.update(
        +id,
        updatePaymentDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedPayment);
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
  ): Promise<ResponseInterface | Error> {
    try {
      const deletedPayment = await this.paymentService.remove(+id, req.user.id);
      return APIResponse(res).statusOK(deletedPayment);
    } catch (error) {
      throw error;
    }
  }
}
