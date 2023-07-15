import { RootAbstractEntity } from '../../../database/entities/root-abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { FileEntity } from './file.entity';

@Entity('products')
export class ProductEntity extends RootAbstractEntity {
  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  kaspi_url: string;

  @Column({ type: 'timestamptz' })
  created_time: Date;

  @Column()
  kaspi_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: string;

  @ManyToOne(() => FileEntity, (file) => file.products)
  file: FileEntity;
}
