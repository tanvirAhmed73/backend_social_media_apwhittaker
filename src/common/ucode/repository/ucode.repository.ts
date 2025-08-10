import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';


const prisma = new PrismaClient

export class UcodeRepository{
    static async createOtp(data){
        const {id, email} = data
        // create six digit otp
        const otp = crypto.randomInt(100000, 1000000).toString();

        // create expiration time 5 minutes
        const expireAt = new Date(Date.now() + 5 * 60 * 1000)
        
        // check that specific user have already the code or not ,if not then create if use then update
        const userDetails = await UcodeRepository.getUserDetails(id);
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


    static async getUserDetails(id){
        const userDetails = await prisma.ucode.findFirst({
            where:{
                userId: id
            }
        })

        return userDetails;
    }
}