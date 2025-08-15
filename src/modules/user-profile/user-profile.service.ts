import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { create } from 'domain';
import { connect } from 'http2';
import { throwError } from 'rxjs';
import { FileService } from 'src/common/file/repository/file.repository';
import { UserRepository } from 'src/common/user/repository/user.repository';
import appConfig from 'src/config/app.config';

const prisma = new PrismaClient()
@Injectable()
export class UserProfileService {
  async uploadProfilePicture(userId, image) {
    try {
      const userDetails = await UserRepository.getUserDetails(userId);
      if(!userDetails){
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
      }

      //update the user avatar in the details
      const updateAvatar = await prisma.user.update({
        where:{
          id:userId
        },
        data:{
          avatar: image.filename
        },
        select:{
          avatar:true
        }
      })
      updateAvatar.avatar = appConfig().app.backEndUrl + appConfig().storageUrl.rootUrlPublic + appConfig().storageUrl.avatar + image.filename

      return {
        status: 200,
        success: true,
        message: "Picture Uploaded Successfully",
        data: updateAvatar

      }
    } catch (error) {
      if(error instanceof HttpException){
        throw error
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }



  async updateProfile(userId, data, images) {
    try {
      const getUserDetails = await UserRepository.getUserDetails(userId);
      if (!getUserDetails) {
        throw new HttpException('User Does not Exist', HttpStatus.BAD_REQUEST);
      }

      let interests = [];

      // Check if data.interest is a string and parse it into an array
      if (typeof data.interest === 'string') {
        try {
          let formattedInterest = data.interest.trim();
          formattedInterest = formattedInterest.replace(/''/g, '"').replace(/'/g, '"');

          interests = JSON.parse(formattedInterest);

          if (!Array.isArray(interests)) {
            throw new Error('Interest format is invalid');
          }


        } catch (e) {
          throw new HttpException('Invalid interest format', HttpStatus.BAD_REQUEST);
        }
      } else if (Array.isArray(data.interest)) {
        interests = data.interest;
      }

      // Fetch the interest IDs from the database
      const existingInterests = await prisma.interest.findMany({
        where: {
          interestItem: { in: interests }, // Find the interests that are part of the data
        },
      });

      // Create a mapping from interest item to interest ID
      const interestMap = existingInterests.reduce((acc, interest) => {
        acc[interest.interestItem] = interest.id; // Map interestItem to interest ID
        return acc;
      }, {});

      // Proceed with the update operation
      const updata = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: data.name,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          age: data.age,
          about: data.about,
          location: data.location,
          updatedAt: new Date(),
          interest: {
            // For each interest, check if it's already linked to the user
            upsert: interests.map((interestItem) => {
              const interestId = interestMap[interestItem]; // Get the interest ID

              if (interestId) {
                return {
                  where: {
                    userId_interestId: {
                      userId: userId,
                      interestId: interestId, // Use the actual interestId
                    },
                  },
                  update: {}, // If it exists, do nothing (i.e., don't update)
                  create: {
                    interest: {
                      connect: {
                        id: interestId, // Use the existing interest ID
                      },
                    },
                  },
                };
              }

              return null; // Skip if no interest ID was found
            }).filter((x) => x !== null), // Remove any null entries (invalid interests)
          },
        },
        select:{
          name:true,               
          phoneNumber:true,        
          email:true,                
          gender:true,         
          starSeedOrigin:true, 
          galasticMission:true,
          about:true,          
          password:true,           
          age:true,                
          location:true,           
          accountStatus:true,
          avatar:true
        }
      });


      // Save uploaded images under the user
      let imagespath:string[] = []
      if (images && images.length > 0) {
        const imagePromises = images.map((file) => {
          imagespath.push(FileService.generateImageUrl(file.fileName))
          return prisma.images.create({
            data: {
              userId: userId,
              imagefile: file.filename,
            },
          });
        });

        // Wait for all image entries to be saved
        await Promise.all(imagePromises);
      }

      const avatarPath = updata.avatar ? FileService.generateAvatarUrl(updata.avatar) : null;

      return {
        status: 200,
        success: true,
        message: "profile update successfully;",
        data:{
          updata,
          avatarPath:avatarPath,
          images: imagespath
        }
      }

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}




}
