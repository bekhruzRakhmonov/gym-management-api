import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";
import { BasePaginationDto } from "src/common/pagination/pagination.dto";

export class MembershipPaginationDto extends BasePaginationDto {
    @ApiProperty({ description: 'Filter by start_date `Membership`' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    start_date: Date;

    @ApiProperty({ description: 'Filter by end_date `Membership`' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    end_date: Date;
}
