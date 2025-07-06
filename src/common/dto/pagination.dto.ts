import { Type } from "class-transformer";

import { 
  IsNumber,
  IsOptional, 
  IsPositive, 
  Min 
} from "class-validator";

export class PaginationDto {

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  @Min(1)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  offset: number;

}