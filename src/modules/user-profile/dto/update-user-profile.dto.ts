import { IsOptional } from "class-validator"


export class UpdateUserProfileDto{
    @IsOptional()
    name : string

    @IsOptional()
    email:string

    @IsOptional()
    phoneNumber:string
    
    @IsOptional()
    gender:string

    @IsOptional()
    age:string

    @IsOptional()
    about:string

    @IsOptional()
    interest:string[]

    @IsOptional()
    location:string
}
