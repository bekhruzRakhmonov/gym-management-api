import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { BasePaginationDto } from 'src/common/pagination/pagination.dto';

export class VisitPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: 'Filter by date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
