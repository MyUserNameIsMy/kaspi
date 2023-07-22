import { RootAbstractEntity } from '../../../database/entities/root-abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { FileEntity } from './file.entity';

@Entity('products')
export class ProductEntity extends RootAbstractEntity {
  @Column()
  name: string;

  @Column({ type: 'float', nullable: true })
  kaspi_price: number;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ type: 'int', nullable: true })
  review_count: number;

  @Column({ nullable: true })
  kaspi_link: string;

  @Column({ type: 'int', nullable: true })
  merchants_count: number;

  @Column({ type: 'jsonb', nullable: true })
  merchants_array: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @ManyToOne(() => FileEntity, (file) => file.products, { onDelete: 'CASCADE' })
  file: FileEntity;
}
