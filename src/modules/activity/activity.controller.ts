import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import JwtAuthGuard from 'src/modules/auth/jwt-auth.guard';
import RequestWithUser from 'src/modules/auth/requestWithUser.interface';
import { Role } from 'src/modules/auth/roles/role.enum';
import { Roles } from 'src/modules/auth/roles/roles.decorator';
import { RolesGuard } from 'src/modules/auth/roles/roles.guard';
import { APIResponse } from 'src/common/http/response/response.api';
import { ResponseInterface } from 'src/common/http/response/response.interface';
import { ValidateDtoPipe } from 'src/common/pipes/dto-validator.pipe';
import { ActivityService } from './activity.service';
import { ActivityPaginationDto } from './dto/pagination.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller('activity')
@ApiTags('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll(
    @Query() query: ActivityPaginationDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const activities = await this.activityService.findAll(query);
      return APIResponse(res).statusOK(activities);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const activity = await this.activityService.findOne(+id);
      return APIResponse(res).statusOK(activity);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ): Promise<ResponseInterface> {
    try {
      const updatedActivity = await this.activityService.update(
        +id,
        updateActivityDto,
        req.user.id,
      );
      return APIResponse(res).statusOK(updatedActivity);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      const deletedActivity = await this.activityService.remove(
        +id,
        req.user.id,
      );
      return APIResponse(res).statusOK(deletedActivity);
    } catch (error) {
      throw error;
    }
  }
}
