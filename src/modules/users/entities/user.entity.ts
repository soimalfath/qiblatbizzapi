import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Role } from '../../auth/enum/role.enum';
import { ProductEntity } from '../../products/entities/product.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  providerID: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER }) // Default role USER
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductEntity, (product) => product.user)
  products: ProductEntity;
}
