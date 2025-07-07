import { 
  HttpStatus, 
  Injectable, 
  Logger, 
  OnModuleInit 
} from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRoles } from './enums/user-roles';
import * as argon from 'argon2';

@Injectable()
export class UsersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('UsersService');

  async onModuleInit() {

    this.$connect();
    this.logger.log('Database connected');

    // Insertar usuario Administrador al iniciar
    const existing = await this.user.findUnique({
      where: { email: 'admin@test.com' }
    });

    if (!existing) {
      await this.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@test.com',
          password: await argon.hash('Admin123'),
          role: UserRoles.admin
        }
      });

      this.logger.log('Usuario admin creado');
    } else {
      this.logger.log('Usuario admin ya existe');
    }

  }

  async create(createUserDto: CreateUserDto) {

    const { name, email, password } = createUserDto;

    const hash = await argon.hash(password);

    return this.user.create({
      data: {
        name: name,
        email: email.toLowerCase().trim(),
        password: hash
      }
    });
    
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const [users, total] = await this.$transaction([
      this.user.findMany({
        skip: offset,
        take: limit,
        where: { deleted: false },
        orderBy: { createdAt: 'desc' },
      }),
      this.user.count(),
    ]);

    return {
      data: users,
      total,
      limit,
      offset
    }

  }

  async findOne(id: string) {

    const user = await this.user.findUnique({
      where: { id, deleted: false }
    });

    if (!user) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `User with id ${id} not found`
      });
    }

    return user;

  }

  async findOneByEmail(email: string) {

    const user = await this.user.findUnique({
      where: { email, deleted: false }
    });

    return user;

  }

  async update(id: string, updateUserDto: UpdateUserDto) {

    const { id: __, ...data } = updateUserDto;

    const user = await this.findOne(id);

    return this.user.update({
      where: { id: user.id },
      data: {
        name: data.name
      }
    });

  }

  async remove(id: string) {
    
    const user = await this.findOne(id);

    return this.user.update({
      where: { id: user.id },
      data: {
        deleted: true
      }
    });

  }

}
