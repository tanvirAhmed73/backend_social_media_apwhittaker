import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';


const prisma = new PrismaClient

export class UcodeRepository{
    static async createOtp({id, email}){
        // create six digit otp
        const otp = crypto.randomInt(100000, 1000000).toString();

        // create expiration time 5 minutes
        const expireAt = new Date(Date.now() + 5 * 60 * 1000)
        
        // check that specific user have already the code or not ,if not then create if use then update
        const userDetails = await UcodeRepository.getUserDetails(email);

        if(userDetails && userDetails.otp){
            await prisma.ucode.update({
                where: { id: userDetails.id }, // Assuming userId is the unique key for OTP
                data: {
                    otp: otp,
                    expireAt: expireAt,
                },
            })

        }else{
            await prisma.ucode.create({
                data:{
                    userId: id,
                    email:email,
                    otp: otp,
                    expireAt: expireAt
                }
            })
        }
        return otp        
    }


    static async getUserDetails(email){
        const userDetails = await prisma.ucode.findFirst({
            where:{
                email: email
            }
        })

        return userDetails;
    }


    static async validateToken({email, otp}){

        const date = new Date().toISOString()
        try {
            const isDataExist = await prisma.ucode.findFirst({
                where: {
                    AND:[
                        {
                            email: email
                        },
                        {
                            otp: otp
                        },
                        {
                            expireAt:{
                                gte: date
                            }
                        }
                    ]
                }
            })

            if(!isDataExist){
                Logger.log("Otp Is Not Valid")
                throw new HttpException("Otp is Invalid", HttpStatus.BAD_REQUEST)
            }


            Logger.log('Otp Is Verify Successfully now updating the database account status')
            await prisma.user.update({
                where:{
                    id:isDataExist.userId
                },
                data:{
                    accountStatus:true,
                    updatedAt: new Date()
                }
            })

            return true

        } catch (error) {
            if(error instanceof HttpException){
                throw error
            }
            throw new HttpException('Internal Server Error',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}