import { Body, Controller, Get, Inject, Param, Post, Query, Req, RequestTimeoutException, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import { timeout } from "rxjs";
import { RESERVAS_SERVICE } from "src/config";
import { CombineGuard } from "src/usuarios/auth/guards/combine.guard";
import { Roles } from "src/usuarios/auth/guards/role.decorator";
import { Role } from "src/usuarios/entity/user.entity";

@Controller('reservas')
@ApiTags('Reservas Departamentos')
export class ReservasController {
    constructor(
        @Inject(RESERVAS_SERVICE)
        private readonly reservasService: ClientProxy
    ) { }

/**
 * @description Endpoint para crear una reserva de un departamento 
 * @param id_depto El id del depto al cual queremos hacer la reserva.
 * @returns Mensaje de éxito o error 
 */
    @Post(':id_depto')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async createReserva(
        @Body() reservaDto: any,
        @Param('id_depto') id_depto: number,
        @Req() req: any) 
        {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado')
        }

        if (!user.id) {
            throw new UnauthorizedException('Usuario no existente')
        }

        const id_usuario = user.id;
        
        try {
            const response = await this.reservasService
                .send({cmd: 'crear-reserva'}, { reservaDto, id_depto, id_usuario })
                .pipe(
                    timeout(50000)
                )
            
                return response;
        } catch (error) {
            if (error) {
                throw new RequestTimeoutException('error en el servidor.');
            }
            throw error;
        }
    }

    /**
 * @description Endpoint buscar ls reservas pendientes.
 * @param reservaDto el dto de las reservas de departamentos
 * @param id_depto el id del depto q queremos filtrar
 * @returns Mensaje de éxito o error.
 */
    @Post('pendientes')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async reservasPendientes(
        @Body() reservaDto: any,
        @Param('id_depto') id_depto: number,
        @Req() req: any
    ) {
        const user = req.user;
        
                const userData = {
                    id: user.id,
                    email: user.email,
                    nombre: user.nombre,
                    role: user.role
                }
        return this.reservasService.send({ cmd: 'reservas-pendientes' }, { reservaDto, id_depto })
    }

    /**
 * @description Endpoint para registrar la salida del departamento
 * @param id_reserva_depto el id de la reserva del departamento
 * @returns Mensaje de éxito o error.
 */
    @Post('salida/:id_reserva_depto')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async registrarSalida(
        @Param('id_reserva_depto') id_reserva_depto: number,
        @Req() req: any
    ) {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado')
        }

        if (!user.id) {
            throw new UnauthorizedException('Usuario no existente')
        }


        if (user.role == 'admin') {
            return this.reservasService.send({ cmd: 'registrar-salida'}, { id_reserva_depto })
        } else {
            throw new UnauthorizedException('No tienes permiso para registrar la salida')
        }
    }

    /**
 * @description Endpoint para mostrar las reservsa de los departments
 * @param params Parametros para listar las reservas de las departments
 * @returns todas las reservas de las departments
 */
    @Get()
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async mostrarReservas(
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

        return this.reservasService.send({cmd: 'mostrar-reservas'}, { params })
    }
}