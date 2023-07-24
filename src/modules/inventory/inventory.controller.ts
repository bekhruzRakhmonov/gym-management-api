import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiTags } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { APIResponse } from 'src/common/http/response/response.api';
import { Response } from 'express';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { InventoryPaginationDto } from './dto/pagination.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const createdInventory = await this.inventoryService.create(
        createInventoryDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdInventory);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() query: InventoryPaginationDto,
    @Res() res: Response,
  ): Promise<ResponseInterface | Error> {
    try {
      const foundInevtories = await this.inventoryService.findAll(query);
      return APIResponse(res).statusOK(foundInevtories);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('products')
  async findAllProducts(
    @Res() res: Response,
  ): Promise<ResponseInterface | Error> {
    try {
      const foundInevtories = await this.inventoryService.findAllProducts();
      return APIResponse(res).statusOK(foundInevtories);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() res: Response,
  ): Promise<ResponseInterface> {
    try {
      const foundInventory = await this.inventoryService.findOne(+id);
      return APIResponse(res).statusOK(foundInventory);
    } catch (error: unknown) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const data = await this.inventoryService.update(
        +id,
        updateInventoryDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(data);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const data = await this.inventoryService.remove(+id, req.user.id);
      return APIResponse(res).statusOK(data);
    } catch (error) {
      throw error;
    }
  }
}
