import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsPaginationDto } from './dto/pagination.dto';
import JwtAuthGuard from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query() query: StatisticsPaginationDto) {
    return this.statisticsService.findAll(query);
  }
}
