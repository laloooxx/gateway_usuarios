import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { RESERVAS_SERVICE } from "src/config";
import { CombineGuard } from "src/usuarios/auth/guards/combine.guard";
import { Roles } from "src/usuarios/auth/guards/role.decorator";
import { Role } from "src/usuarios/entity/user.entity";

@Controller('registro-parcelas')
export class RegistroParcelas {
    constructor(
        @Inject(RESERVAS_SERVICE)
        private readonly reservaService: ClientProxy
    ) { }

    /**
     * @description Endpoint para registrar el ingreso de un cliente a una parcela 
     * @param registroDto datos del registro de ingreso
     * @param id_parcela el id de la parcela a la qse ingresa
     * @returns el registro del ingreso
     */
    @Post('ingreso/:id_parcela')
    @UseGuards(CombineGuard)
    @Roles(Role.CLIENT)
    async registrarIngreso(
        @Body() registroDto: any,
        @Param('id_parcela') id_parcela: number,
        @Req() req: any
    ) {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado')
        }

        if (!user.id) {
            throw new UnauthorizedException('Usuario no existente')
        }

        const userData = { 
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }
        
        return this.reservaService.send('registrar_ingreso', {registroDto, 
            id_parcela, 
            id_usuario: userData.id, 
            usuario: userData})
    }


    /**
     * @description endpoint para registrar la salida de un cliente de una parcela.
     * @param codigoUnico codigo unico de ingreso que el cliente debe proporcionar para salir.
     * @returns el registro actualizado  con la fecha de salida
     */
    @Post('salida/:codigoUnico')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async registrarSalida(
        @Param('codigoUnico') codigoUnico: string,
        @Req() req: any
    ) {
        const user = req.user;
        
        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado')
        }

        if (!user.id) {
            throw new UnauthorizedException('Usuario no existente')
        }

        const userData = { 
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservaService.send('registrar_salida', {codigoUnico, id_usuario: userData.id})
    }


    /**
     * @description endpoint para obtener todos los registros
     * @returns todos los registros
     */
    @Get()
    @UseGuards(CombineGuard)
    @Roles(Role.CLIENT)
    async obtenerRegistros(
        @Query() params: any,
        @Req() req: any
    ) {
        const user = req.user;

        const userData = { 
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservaService.send('obtener_registros', {params, id_usuario: userData.id})
    }


    /**
 * @description Endpoint para eliminar un registro de parcela por su código único.
 * @param codigoUnico El código único del registro a eliminar.
 * @returns Mensaje de éxito o error si no se encuentra el registro.
 */
    @Delete(':codigoUnico')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async eliminarRegistro(
        @Param('codigoUnico') codigoUnico: string,
        @Req() req: any
    ) {
        const user = req.user;

        const userData = { 
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservaService.send('eliminar-registro',{codigoUnico, id_usuario: userData.id})
    }
}