import { IsEmail, IsEnum, isEnum, IsString } from "class-validator";
import { Role } from "./user.entity";

export class LoginDto {

    @IsString()
    password: string;

    @IsEmail()
    email: string;
}
  