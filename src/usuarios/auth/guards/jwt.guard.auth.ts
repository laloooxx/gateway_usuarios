import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { firstValueFrom, Observable } from "rxjs";


@Injectable()
export class JwtGuard extends AuthGuard('jwt') implements CanActivate {
    constructor() {
        super();
    }
    //CanActivate permite añadir lógica personalizada antes o después de la autenticación estándar si fuera necesario.
    async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('JwtGuard ejecutado en ruta:', context.getHandler().name);
        try {
            const result = super.canActivate(context);
            console.log('Resultado de canActivate:', result);
            if (result instanceof Observable) {
                return await firstValueFrom(result);
            }
            return result as boolean; // Devolver explícitamente el resultado
        } catch (error) {
            console.error('Error en canActivate:', error);
            throw new UnauthorizedException('Error en la autenticación');
        }
    }


    //manejamos los errores y si todo sale bien retornamos al usuario
    handleRequest(err: any, user: any, info: any) {

        if (err) {
            console.error('Error en JwtGuard:', err);
            throw new UnauthorizedException('error indefinido', err);
        }
        if (!user) {throw new UnauthorizedException('usuario no autorizado');
        }
        return user;
    }
}

/**async canActivate(context: ExecutionContext): Promise<boolean> {
        console.log('JwtGuard ejecutado');
        const result = super.canActivate(context);

        //si el resultado de super.canActivate(context) es un Observable, utilizamos firstValueFrom de RxJS para convertirlo en una Promise.
        if (result instanceof Observable) {
            return await firstValueFrom(result); //Convertimos el Observable en un Promise<boolean>
        }

        result as Boolean; // Si no es Observable, asumimos que es boolean o Promise<boolean>s
    }
 */