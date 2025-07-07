import { Controller } from '@nestjs/common';

import { 
  MessagePattern, 
  Payload 
} from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto';
import { LoginUserDto } from './dto';

@Controller()
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('register-user')
  register(@Payload() registerUserDto: CreateUserDto) {
    return this.authService.register(registerUserDto);
  }

  @MessagePattern('login-user')
  login(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern('auth-verify')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }

}
