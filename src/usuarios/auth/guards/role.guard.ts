import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEYS } from "./role.decorator";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        console.log('RolesGuard ejecutado')
        //Usamos el reflector para obtener los roles definidos mediante un decorador en el controlador o en la clase.
        const requiredRole = this.reflector.getAllAndOverride<string[]>(ROLES_KEYS, [
            context.getHandler(), //obtenemos el método de la ruta.
            context.getClass() //obtenemos la clase que define la ruta.
        ]);
        
        console.log('Roles requeridos:', requiredRole);
        
        //filtramos las rutas q no requieran roles
        if (!requiredRole) {
            console.log('Ruta no requiere roles.');
            return true;
        }


        //recuperamos al usuario de la solicitud actual
        const request = context.switchToHttp().getRequest();
        console.log('Headers recibidos:', request.headers);
        const user = request.user;

        
        if (user.role === 'admin') {
            return true;
        }

        console.log('Usuario en RolesGuard:', user);
        console.log('Role del usuario:', user?.role);

        // Verificamos que el usuario exista y tenga un rol.
        if (!user || !user.role) {
            console.error('Usuario no autenticado o sin roles.');
            throw new UnauthorizedException('Usuario no autenticado o sin roles');
        }


        //verificamos si alguno de los roles requeridos está en los roles del usuario
        const hasRole = requiredRole.includes(user.role);
        
        console.log('Roles requeridos:', requiredRole);
        console.log('¿Usuario tiene el rol requerido?:', hasRole);
        console.log('Roles del usuario:', user?.role);

        if (!hasRole) {
            console.error('Usuario no tiene el rol requerido.');
            throw new UnauthorizedException('No tienes los permisos necesarios')
        }

        return true;
    }
}