import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}
  create(id: string, createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create({
      ...createProductDto,
      user: { id: id },
    });
    return this.productRepository.save(newProduct);
  }

  async findAll(userId: string) {
    const products = await this.productRepository.find({
      where: { user: { id: userId } },
      // take: 10, // Mengambil hanya 10 produk
    });
    return products;
  }

  async findOne(id: number, userId: string) {
    const product = await this.productRepository.findOne({
      where: { id: id, user: { id: userId } }, // Validasi kepemilikan produk
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found or you do not have access to this product.',
      );
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Assign data baru ke entitas yang sudah ada
    Object.assign(product, updateProductDto);

    // Simpan perubahan
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    return this.productRepository.delete(id);
  }
}
