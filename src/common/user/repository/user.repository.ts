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
}