import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  // Query,
  Res,
  Body,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { Response, Request } from 'express';
import { ResponseHelper } from '../../utils/response.helper';
import { lastValueFrom } from 'rxjs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from '../products/products.service';
import { GenerateCopywriting } from './dto/create-ai.dto';
import { prompt } from '../../helper/prompt';
import { UserEntity } from '../users/entities/user.entity';
// import { CreateAiDto } from './dto/create-ai.dto';
// import { UpdateAiDto } from './dto/update-ai.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly productService: ProductsService,
  ) {}

  @Post()
  create() {
    return this.aiService.create();
  }
  @Post('copywriting')
  @UseGuards(JwtAuthGuard)
  async generateCopyWriting(
    @Body() generateCopywriting: GenerateCopywriting,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const user = req.user as UserEntity;
      const productId = generateCopywriting.productId;
      const UserId = user.id;
      const type = generateCopywriting.type;
      const product = await this.productService.findOne(+productId, UserId);
      const prompting = prompt(
        type,
        product.description,
        product.name,
        product.categories,
      );
      const data = await lastValueFrom(
        this.aiService.generateCopyWriting(prompting),
      );
      console.log(data);
      return res.json(
        ResponseHelper.success('Success generate copywriting', data),
      );
    } catch (err) {
      console.error(err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Internal Server Error', 500));
    }
  }

  @Get()
  findAll() {
    return this.aiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.aiService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiService.remove(+id);
  }
}