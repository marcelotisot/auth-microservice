import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { UserRoles } from './enums/user-roles';
import * as argon from 'argon2';
import { UpdateUserDto } from './dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  };

  const mockPrisma = {
    user: mockUserModel,
    $connect: jest.fn(),
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: {
            ...mockPrisma,
            logger: { log: jest.fn() },
            onModuleInit: UsersService.prototype.onModuleInit,
            create: UsersService.prototype.create,
            findOne: UsersService.prototype.findOne,
            remove: UsersService.prototype.remove,
            findAll: UsersService.prototype.findAll,
            findOneByEmail: UsersService.prototype.findOneByEmail,
            update: UsersService.prototype.update,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {

    it('should create admin user if not exists', async () => {

      mockUserModel.findUnique.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({});

      jest.spyOn(argon, 'hash').mockResolvedValue('hashedPassword');

      await service.onModuleInit();

      expect(mockPrisma.$connect).toHaveBeenCalled();

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
      });

      expect(mockUserModel.create).toHaveBeenCalledWith({
        data: {
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'hashedPassword',
          role: UserRoles.admin,
        },
      });

    });

    it('should not create admin user if already exists', async () => {

      mockUserModel.findUnique.mockResolvedValue({ id: '123' });

      await service.onModuleInit();

      expect(mockUserModel.create).not.toHaveBeenCalled();

    });

  }); // onModuleInit

  describe('create', () => {

    it('should hash password and create user', async () => {

      jest.spyOn(argon, 'hash').mockResolvedValue('hashed123');

      const dto = {
        name: 'Test User',
        email: 'test@user.com',
        password: '123456',
      };

      mockUserModel.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(result).toEqual({ id: '1', ...dto });

      expect(argon.hash).toHaveBeenCalledWith(dto.password);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase().trim(),
          password: 'hashed123',
        },
      });

    });

  }); // create

  describe('findAll', () => {

    it('should return paginated users', async () => {

      const users = [
        { id: '1', name: 'User1', deleted: false },
        { id: '2', name: 'User2', deleted: false },
      ];

      const totalUsers = 20;

      mockPrisma.$transaction.mockResolvedValue([users, totalUsers]);

      const paginationDto = { limit: 2, offset: 0 };

      const result = await service.findAll(paginationDto);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        data: users,
        total: totalUsers,
        limit: 2,
        offset: 0,
      });

    });

    it('should use default pagination if not provided', async () => {

      const users = [];

      mockPrisma.$transaction.mockResolvedValue([users, 0]);

      const result = await service.findAll({} as any);

      expect(result).toEqual({
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      });
    });

  }); // findAll


  describe('findOne', () => {
    it('should return user if found', async () => {

      const user = { id: '1', name: 'Test', deleted: false };

      mockUserModel.findUnique.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { id: '1', deleted: false },
      });

    });

    it('should throw RpcException if user not found', async () => {

      mockUserModel.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(RpcException);

      try {

        await service.findOne('1');

      } catch (error) {

        expect(error.getError()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          message: 'User with id 1 not found',
        });

      }

    });

  }); // findOne

  describe('findOneByEmail', () => {

    it('should return a user by email if found', async () => {
      const user = { id: '1', email: 'test@test.com', deleted: false };

      mockUserModel.findUnique.mockResolvedValue(user);

      const result = await service.findOneByEmail('test@test.com');

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com', deleted: false },
      });

      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      mockUserModel.findUnique.mockResolvedValue(null);

      const result = await service.findOneByEmail('notfound@test.com');

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'notfound@test.com', deleted: false },
      });

      expect(result).toBeNull();
    });

  }); // findOneByEmail

  describe('update', () => {

    it('should update and return the user', async () => {

      const id = 'user-id-123';
      
      const updateUserDto: UpdateUserDto = {
        id,
        name: 'Updated Name',
        email: 'should-not-be-used@test.com',
        password: 'should-not-be-used',
      };

      const existingUser = {
        id,
        name: 'Old Name',
        email: 'old@test.com',
        deleted: false,
      };

      const updatedUser = {
        ...existingUser,
        name: 'Updated Name',
      };

      // Mock findOne para que devuelva un usuario válido
      jest.spyOn(service, 'findOne').mockResolvedValue(existingUser as any);

      // Mock update de Prisma
      mockUserModel.update.mockResolvedValue(updatedUser);

      const result = await service.update(id, updateUserDto);

      expect(service.findOne).toHaveBeenCalledWith(id);

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: { name: 'Updated Name' },
      });

      expect(result).toEqual(updatedUser);

    });

  }); // update

  describe('remove', () => {

    it('should mark user as deleted', async () => {
      
      const user = { id: '1', deleted: false };

      const updated = { ...user, deleted: true };

      jest.spyOn(service, 'findOne').mockResolvedValue(user as User);

      mockUserModel.update.mockResolvedValue(updated);

      const result = await service.remove('1');

      expect(result).toEqual(updated);

      expect(service.findOne).toHaveBeenCalledWith('1');

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { deleted: true },
      });

    });

  }); // remove

});
