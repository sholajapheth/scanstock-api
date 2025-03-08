import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUpdateDto } from './dto/create-update.dto';
import { UpdateUpdateDto } from './dto/update-update.dto';
import { UpdateService } from './update.service';

@ApiTags('app-updates')
@ApiBearerAuth('JWT-auth')
@Controller('app-updates')
@UseGuards(JwtAuthGuard)
export class AppUpdateController {
  constructor(private readonly updateService: UpdateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new app update configuration' })
  @ApiResponse({
    status: 201,
    description: 'The app update configuration has been successfully created.',
  })
  create(@Body() createUpdateDto: CreateUpdateDto) {
    return this.updateService.create(createUpdateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all app update configurations' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of all app update configurations.',
  })
  findAll() {
    return this.updateService.findAll();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest app update configuration' })
  @ApiResponse({
    status: 200,
    description: 'Returns the latest app update configuration.',
  })
  findLatest() {
    return this.updateService.findLatest();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an app update configuration' })
  @ApiParam({ name: 'id', description: 'App update configuration ID' })
  @ApiResponse({
    status: 200,
    description: 'The app update configuration has been successfully updated.',
  })
  update(@Param('id') id: string, @Body() updateData: UpdateUpdateDto) {
    return this.updateService.update(+id, updateData);
  }

  @Patch(':id/force')
  @ApiOperation({
    summary: 'Set force update flag for an app update configuration',
  })
  @ApiParam({ name: 'id', description: 'App update configuration ID' })
  @ApiResponse({
    status: 200,
    description: 'The force update flag has been set.',
  })
  setForceUpdate(@Param('id') id: string, @Body() data: { force: boolean }) {
    return this.updateService.setForceUpdate(+id, data.force);
  }
}
