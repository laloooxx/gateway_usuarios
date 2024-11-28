import { Role } from "src/usuarios/entity/user.entity";

export class Payload {
    sub: number;
    email: string;
    nombre: string;
    role: Role;
}