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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product/create-product.dto';
import { UpdateProductDto } from './dto/product/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { Response } from 'express';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { APIResponse } from 'src/common/http/response/response.api';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { ProductPaginationDto } from './dto/product/pagination.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const createdProduct = await this.productService.create(
        createProductDto,
        req.user.id,
      );
      return APIResponse(res).statusCreated(createdProduct);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() query: ProductPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const products = await this.productService.findAll(query);
      return APIResponse(res).statusOK(products);
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
      const product = await this.productService.findOne(+id);
      return APIResponse(res).statusOK(product);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const updatedProduct = await this.productService.update(
        +id,
        updateProductDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedProduct);
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
      const deletedProduct = await this.productService.remove(+id, req.user.id);
      return APIResponse(res).statusOK(deletedProduct);
    } catch (error) {
      throw error;
    }
  }
}
