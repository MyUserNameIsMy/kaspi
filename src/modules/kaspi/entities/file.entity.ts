import { RootAbstractEntity } from '../../../database/entities/root-abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';
import { FileStatusEnum } from '../../../common/enums/file-status.enum';

@Entity('files')
export class FileEntity extends RootAbstractEntity {
  @Column()
  path: string;

  @Column()
  filename: string;

  @Column({ type: 'enum', enum: FileStatusEnum, default: FileStatusEnum.NEW })
  status: FileStatusEnum;

  @Column({ type: 'int' })
  product_found_count: number;

  @OneToMany(() => ProductEntity, (product) => product.file)
  products: ProductEntity[];
}
