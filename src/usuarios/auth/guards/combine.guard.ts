import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtGuard } from "./jwt.guard.auth";
import { RolesGuard } from "./role.guard";
import { Observable } from 'rxjs';

@Injectable()
export class CombineGuard implements CanActivate {
    constructor(
        private jwtGuard: JwtGuard, 
        private rolesGuard: RolesGuard 
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            // Primero, validamos el JWT
            const jwtResult = await this.executeGuard(this.jwtGuard, context);
            
            if (!jwtResult) {
                throw new UnauthorizedException('Token inválido');
            }

            // Luego, validamos los roles
            const rolesResult = await this.executeGuard(this.rolesGuard, context);
            
            if (!rolesResult) {
                throw new UnauthorizedException('No tienes permisos suficientes');
            }

            return true;
        } catch (error) {
            console.error('Error en CombineGuard:', error);
            throw error;
        }
    }

    private async executeGuard(guard: CanActivate, context: ExecutionContext): Promise<boolean> {
        const result = guard.canActivate(context);
        if (result instanceof Observable) {
            return await this.firstValueFrom(result);
        }
        return result as boolean;
    }

    private async firstValueFrom<T>(obs: Observable<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            obs.subscribe({
                next: (value) => {
                    resolve(value);
                },
                error: (err) => {
                    reject(err);
                },
                complete: () => {
                    reject(new Error('Observable completed without emitting a value'));
                }
            });
        });
    }
}