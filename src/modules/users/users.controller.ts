import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller()
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('create-user')
  create(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern('find-all-users')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @MessagePattern('find-one-user')
  findOne(@Payload() id: string) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('find-one-user-by-email')
  findOneByEmail(@Payload() email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @MessagePattern('update-user')
  update(@Payload() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern('remove-user')
  remove(@Payload() id: string) {
    return this.usersService.remove(id);
  }

}
