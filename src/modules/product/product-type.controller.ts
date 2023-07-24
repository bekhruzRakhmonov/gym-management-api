import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { APIResponse } from 'src/common/http/response/response.api';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { CreateProductTypeDto } from './dto/product_type/create-product-type.dto';
import { ProductTypePaginationDto } from './dto/product_type/pagination.dto';
import { ProductTypeService } from './product-type.service';
import { UpdateProductTypeDto } from './dto/product_type/update-product-type';

@ApiTags('product types')
@Controller('product-type')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createProductType(
    @Body() createProductTypeDto: CreateProductTypeDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const createdProductType = await this.productTypeService.create(
        createProductTypeDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdProductType);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() query: ProductTypePaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const productTypes = await this.productTypeService.findAll(query);
      return APIResponse(res).statusOK(productTypes);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductTypeDto: UpdateProductTypeDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const updatedProductType = await this.productTypeService.update(
        +id,
        updateProductTypeDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedProductType);
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
      const deletedProductType = await this.productTypeService.remove(
        +id,
        req.user.id,
      );
      return APIResponse(res).statusOK(deletedProductType);
    } catch (error) {
      throw error;
    }
  }
}
