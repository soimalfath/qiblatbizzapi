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
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { ResponseHelper } from '../../utils/response.helper';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createProductDto: CreateProductDto,
  ) {
    try {
      const reqUser = req.user as UserEntity;
      const userId = reqUser.id;
      const product = await this.productsService.create(
        userId,
        createProductDto,
      );
      if (product) {
        return res
          .status(HttpStatus.OK)
          .json(ResponseHelper.success('Succes add products', product));
      }
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed get products', err.message));
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const reqUser = req.user as UserEntity;
      const userId = reqUser.id;
      const products = await this.productsService.findAll(userId);
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('Succes get products', products));
    } catch (err) {
      console.error('Failed get products', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed get products', err.message));
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req.user as UserEntity;
      const Userid = user.id;
      const product = await this.productsService.findOne(+id, Userid);
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('Succes get products', product));
    } catch (err) {
      console.error('Failed get products', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed get product', err.message));
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const user = req.user as UserEntity;
      const id = user.id;
      const product = await this.productsService.findOne(+id, id);
      if (product) {
        const products = await this.productsService.update(
          +id,
          updateProductDto,
        );
        if (products) {
          return res
            .status(HttpStatus.OK)
            .json(ResponseHelper.success('Succes update product'));
        }
        return;
      }
    } catch (err) {
      console.error('Failed get products', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed update product', err.message));
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req.user as UserEntity;
      const userId = user.id;
      const product = await this.productsService.findOne(+id, userId);
      if (product) {
        const result = await this.productsService.remove(+id);
        if (result.affected !== 0) {
          return res
            .status(HttpStatus.OK)
            .json(ResponseHelper.success('Succes delete product'));
        }
        return;
      }
    } catch (err) {
      console.error('Failed get products', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed update product', err.message));
    }
  }
}
