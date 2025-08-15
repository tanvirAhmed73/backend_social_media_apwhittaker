import { Controller, Post, UseGuards, Req, UseInterceptors, UploadedFile, Patch, UploadedFiles, Body } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import multer, { diskStorage } from 'multer';
import appConfig from 'src/config/app.config';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('upload-picture')
  @UseInterceptors(FileInterceptor('image',{
    storage: diskStorage({
      destination:
        appConfig().storageUrl.rootUrl + appConfig().storageUrl.avatar,
        filename: (req, file, cb)=>{
          const randomName = Array(32).fill(null).map(()=>Math.round(Math.random() * 16).toString()).join('');
          return cb(null, `${randomName}${file.originalname}`)
      },
    }),
  }))
  async uploadProfilePicture(@Req() req:Request, @UploadedFile() image: Express.Multer.File) {
    const userId = req.user.userId
    const response = await this.userProfileService.uploadProfilePicture(userId, image);
    return response
  }

  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images',10, {
     storage: diskStorage({
      destination: appConfig().storageUrl.rootUrl + appConfig().storageUrl.pictures,
      filename: (req, file, cb)=>{
        const randomName = Array(32).fill(null).map(()=>Math.round(Math.random() * 16).toString()).join('');
        return cb(null, `${randomName}${file.originalname}`)
      }
     })
  }))
  async updateProfile(@Body() data:UpdateUserProfileDto ,@Req() req:Request, @UploadedFiles() images:Array<Express.Multer.File>){
    const userId = req.user.userId
    const response = await this.userProfileService.updateProfile(userId, data, images)
    return response
  }  
}
