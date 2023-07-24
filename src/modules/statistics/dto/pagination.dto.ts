import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/pagination/pagination.dto';

export class StatisticsPaginationDto extends BasePaginationDto {
  //   @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  date?: string;

  @ApiPropertyOptional({ description: 'month, year, week' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  @Transform(({ value }) => {
    if (value !== 'year' && value !== 'month' && value !== 'week') {
      return 'year';
    }
    return value;
  })
  sortDateBy?: string;
}
