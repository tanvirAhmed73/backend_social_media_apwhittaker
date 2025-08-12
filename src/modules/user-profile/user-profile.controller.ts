import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('upload-picture')
  async create(@Req() req:Request ,@Body() createUserProfileDto: CreateUserProfileDto) {
    const userId = req.user.userId
    const response = this.userProfileService.create(createUserProfileDto);

    return response
  }

  
}
