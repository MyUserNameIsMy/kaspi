import { RootAbstractEntity } from '../../../database/entities/root-abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity('files')
export class FileEntity extends RootAbstractEntity {
  @Column()
  path: string;

  @Column()
  filename: string;

  @OneToMany(() => ProductEntity, (product) => product.file)
  products: ProductEntity[];
}
