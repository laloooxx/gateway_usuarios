import { ForbiddenException, forwardRef, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserDto } from "../entity/userDto";
import { UsuarioService } from "../usuarios.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly jWTService: JwtService,
        @Inject(forwardRef(() => UsuarioService))
        private readonly userService: UsuarioService
    ) { }
    private readonly logger = new Logger('AuthLogger');

    
    //creamos una function para generar el token
    /**
   * Generates a JWT token for the given user.
    * @param usuario User data for the payload.
    * @returns Signed JWT token.
    */
    async generateToken(usuario: UserDto): Promise<string> {
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            role: usuario.role
        };

        //retornamos el token 
        return this.jWTService.signAsync(payload);
    }

    //creamos una función encargada de verificar y desestructurar el token
    /**
   * Verifies and decodes a JWT token.
   * @param token JWT token to verify.
   * @returns Decoded payload.
   * @throws UnauthorizedException if the token is invalid.
   */
    async verifyJWT(token: string): Promise<any> {
        try {
            //retorna el token "desarmado"
            return await this.jWTService.verifyAsync(token);

        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }


    /**
     * @param password new user password
     * @returns hashed password
     */

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12)
    }

    /** 
     * @description compares the login password with the stored
     * @param password input password
     * @param hashPassword stored users password 
     * @returns boolean is password this equivalent
     */

    async comparePassword(password: string, hashPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashPassword);
    }


    /**
   * Verifies if a user's role matches the required role.
   * @param role Required role(s).
   * @param token User's JWT token.
   * @returns Whether the role matches.
   * @throws ForbiddenException if the role does not match.
   */
    async verifyRole(role: string, token: string): Promise<boolean> {
        try {
            const decodedUser = await this.verifyJWT(token);
            const usuario = await this.userService.getOne(decodedUser.sub);

            if (!role.includes(usuario.role)) {
                throw new ForbiddenException('Permisos insuficientes');
            }

            return true
        } catch (error) {
            throw new UnauthorizedException('Token invalido o rol necesario');
        }
    }
}