import { RootAbstractEntity } from '../../../database/entities/root-abstract.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AccountStatusEnum } from '../../../common/enums/account-status.enum';

@Entity('users')
export class UserEntity extends RootAbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    default: AccountStatusEnum.INACTIVE,
  })
  account_status: AccountStatusEnum;

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password_hash = await bcrypt.hash(
      password || this.password_hash,
      salt,
    );
  }

  async validatePassword(password: string) {
    return await bcrypt.compare(password, this.password_hash);
  }
}
