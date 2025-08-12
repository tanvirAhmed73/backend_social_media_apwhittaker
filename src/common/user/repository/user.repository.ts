import { HttpException, HttpStatus } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()
export class UserRepository{

    // check user exist or not
    static async exist({field, value}){
        const isExist = await prisma.user.findFirst({
            where:{
                [field] : value
            }
        })

        return isExist? true : false;
    }

    // saved user in the database
    static async createUser(data){
        const hashPassword = await bcrypt.hash(data.password, 10);
        data.password = hashPassword
        const savedData = await prisma.user.create({data})
        if(!savedData){
            throw new HttpException("Failed To Create User",HttpStatus.BAD_REQUEST)
        }
        const {password:_, ...sendWithoutPassword} = savedData
        return sendWithoutPassword;
    }

    static async validatePassword(email, password){
        try {
            const user = await prisma.user.findFirst({
                where:{
                    email:email
                }
            })
            if(!user){
                throw new HttpException('Email Not Exist',HttpStatus.BAD_REQUEST)
            }
            
            const comparePassword = await bcrypt.compare(password, user.password);

            const {password:_, ...userDataWithoutPassword} = user
            return comparePassword ? userDataWithoutPassword : false
        } catch (error) {
            if(error instanceof HttpException){
                throw error
            }
            throw new HttpException('Internal Server Error',HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    static async isAccountActive(userId){
      const isActive = await prisma.user.findFirst({
        where:{
            AND:[
                {
                    id: userId
                },
                {
                    accountStatus: true
                }
            ]
        }
      })  
      
      return isActive ? true : false
    }
}