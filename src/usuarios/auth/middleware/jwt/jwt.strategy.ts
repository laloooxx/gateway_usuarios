import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


//creamos una estrategia, para bloquear todas las rutas del proyecto
@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SEED,
        });
    }


    async validate(payload: any) {
        console.log('Payload decodificado en JwtStrategy:', payload);
          console.log('JWTStrategy - Validando payload');
        if (!payload.sub || !payload.email || !payload.role) {
            console.error('JWTStrategy - Payload inválido');
            throw new UnauthorizedException('Token inválido');
        }
        const user = {id: payload.sub, email: payload.email, nombre: payload.nombre, role: payload.role}
        console.log('JWTStrategy - Usuario extraído:', user);
        return user;
    };
    //Con estas clases, JWT nos permite bloquear todas las peticiones, y obtener el token desde las mismas. Le pasamos la firma para que le de un OK si es válido, o un 401 caso contrario.
};