import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    
    @IsNotEmpty()
    @IsString()
    phoneNumber: string
    
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
   
    @IsNotEmpty()
    @IsString()
    name: string
    
    @IsNotEmpty()
    @IsString()
    gender: string
    
    @IsNotEmpty()
    @IsString()
    starSeedOrigin: string
    
    @IsNotEmpty()
    @IsString()
    galasticMission: string
    
    @IsNotEmpty()
    @IsString()
    about: string
   
    @IsNotEmpty()
    @IsString()
    password: string
}
