import { 
  HttpStatus, 
  Injectable, 
  Logger, 
  OnModuleInit 
} from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces';
import { envs } from '../../config';
import * as argon from 'argon2';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async register(registerUserDto: CreateUserDto) {

    const { email } = registerUserDto;

    try {

      const user = await this.usersService.findOneByEmail(email);

      if (user) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User already exists'
        });
      }

      const newUser = await this.usersService.create(registerUserDto);

      // Excluir el password
      const { password: __, ...rest } = newUser;

      // Payload
      const payload: JwtPayload = {
        id: rest.id,
        name: rest.name,
        email: rest.email,
        role: rest.role,
      }

      return {
        user: rest,
        token: await this.generateToken(payload)
      }

    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
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

    // Excluir el password
    const { password: __, ...rest } = user;

    // Payload
    const payload: JwtPayload = {
      id: rest.id,
      name: rest.name,
      email: rest.email,
      role: rest.role,
    }

    return {
      user: rest,
      token: await this.generateToken(payload)
    }

  }

  async verifyToken(token: string) {

    try {

      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,

        // Volver a generar el token
        token: await this.generateToken(user)
      }
      
    } catch (error) {

      this.logger.error(error);

      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token'
      });

    }
    
  }

}
