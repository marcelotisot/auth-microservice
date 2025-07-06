import { 
  HttpStatus, 
  Injectable, 
  Logger, 
  OnModuleInit 
} from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService
  ) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async register(registerUserDto: CreateUserDto) {

    const user = await this.usersService.create(registerUserDto);

    return {
      user,
      token: 'asdasdasdm21312k312kmASD123123123'
    }

  }

  async login(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials (email)'
      });
    }

    const isMatch = await argon.verify(user.password, password);

    if (!isMatch) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials (password)'
      });
    }

    return {
      user,
      token: 'asdkasdkasndjasdkasndjasd!@#1ksadmaskd'
    }


  }

}
