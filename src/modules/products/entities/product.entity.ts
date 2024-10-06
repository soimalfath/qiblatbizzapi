import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  price: number;

  @Column({ type: 'text', nullable: true })
  picture: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  hpp: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  sold: number;

  @Column('text')
  categories: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.products)
  user: UserEntity;
}
