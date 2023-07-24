import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BasePaginationDto } from 'src/common/pagination/pagination.dto';

export class PaymentPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: 'Filter by `member_id`' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  member_id?: number;

  @ApiPropertyOptional({ description: 'Filter by start_date `Membership`' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiPropertyOptional({ description: 'Filter by end_date `Membership`' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;
}
