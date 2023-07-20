import { RootAbstractEntity } from '../../../database/entities/root-abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { FileEntity } from './file.entity';

@Entity('product_names')
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
  suppliers_count: number;

  @Column({ type: 'text', array: true, nullable: true })
  suppliers_array: string[];

  @Column({ type: 'float', default: 0 })
  price: number;

  @ManyToOne(() => FileEntity, (file) => file.product_names)
  file: FileEntity;
}
