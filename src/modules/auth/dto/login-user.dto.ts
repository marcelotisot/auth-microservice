import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  IsStrongPassword, 
  MaxLength, 
  MinLength 
} from "class-validator";

export class LoginUserDto {

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsStrongPassword()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(22)
  password: string;

}