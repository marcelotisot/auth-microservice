import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {

    create: jest.fn((dto) => ({
      id: 'abc123',
      ...dto,
    })),

    findAll: jest.fn((paginationDto: PaginationDto) => ({
      data: [{ id: '1', email: 'user@example.com' }],
      total: 1,
      page: paginationDto.offset,
      limit: paginationDto.limit,
    })),

    findOne: jest.fn((id: string) => ({
      id,
      email: 'user@example.com',
    })),

    findOneByEmail: jest.fn((email: string) => ({
      id: 'user-id-123',
      email,
    })),

    update: jest.fn((id: string, dto: UpdateUserDto) => {
      const { id: _, ...rest } = dto;
      return { id, ...rest };
    }),

    remove: jest.fn((id: string) => ({
      id,
      deleted: true,
    })),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        }
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user via @MessagePattern', async () => {

    const dto: CreateUserDto = {
      name: 'test user',
      email: 'test@example.com',
      password: 'secure123',
    };

    const result = await controller.create(dto);

    expect(result).toEqual({
      id: 'abc123',
      name: 'test user',
      email: 'test@example.com',
      password: 'secure123',
    });

    expect(service.create).toHaveBeenCalledWith(dto);

  });

  it('should return paginated users', async () => {

    const paginationDto: PaginationDto = { offset: 1, limit: 10 };

    const result = await controller.findAll(paginationDto);

    expect(result).toEqual({
      data: [{ id: '1', email: 'user@example.com' }],
      total: 1,
      page: 1,
      limit: 10,
    });

    expect(service.findAll).toHaveBeenCalledWith(paginationDto);

  });

   it('should return a user by id', async () => {

    const userId = 'abc123';

    const result = await controller.findOne(userId);

    expect(result).toEqual({
      id: 'abc123',
      email: 'user@example.com',
    });

    expect(service.findOne).toHaveBeenCalledWith(userId);

  });

   it('should return user by email', async () => {

    const email = 'test@example.com';

    const result = await controller.findOneByEmail(email);

    expect(result).toEqual({
      id: 'user-id-123',
      email: 'test@example.com',
    });

    expect(service.findOneByEmail).toHaveBeenCalledWith(email);

  });

  it('should update the user based on UpdateUserDto', async () => {
    const dto: UpdateUserDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'updated@example.com',
      name: 'Updated User',
    };

    const result = await controller.update(dto);

    expect(result).toEqual({
      id: dto.id,
      email: dto.email,
      name: dto.name,
    });

    expect(service.update).toHaveBeenCalledWith(dto.id, dto);
  });

  it('should remove the user by id', async () => {

    const userId = 'b95c79b3-7f30-4171-93f4-e1cdcc6b8e1a';

    const result = await controller.remove(userId);

    expect(result).toEqual({
      id: userId,
      deleted: true,
    });

    expect(service.remove).toHaveBeenCalledWith(userId);

  });

});
