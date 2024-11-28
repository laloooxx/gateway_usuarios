import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { RESERVAS_SERVICE } from "src/config";
import { CombineGuard } from "src/usuarios/auth/guards/combine.guard";
import { Roles } from "src/usuarios/auth/guards/role.decorator";
import { Role } from "src/usuarios/entity/user.entity";

@Controller('departamento')
export class DepartamentoController {
    constructor(
        @Inject(RESERVAS_SERVICE)
        private readonly reservasService: ClientProxy
    ) { }


    /**
     * @description endpoint para mostrar los departamentos creados
     * @returns todos los departamentos
     */
    @Get()
    @UseGuards(CombineGuard)
    @Roles(Role.CLIENT)
    async getDepto(
        @Req() req: any
    ) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservasService.send({ cmd: 'get-depto' }, {})
    }


    /**
     * @description endpoint para mostrr un solo departamento 
     * @param id_depto el id del departamento q queremos mostrar 
     * @returns el departamento filtrado x su id
     */
    @Get(':id_depto')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async findOneDepto(
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
        return this.reservasService.send({ cmd: 'find-depto' }, id_depto)
    };


/**
     * @description endpoint para actualizar un departamento x su id
     * @param id el id del departamento q queremos actualizar
     * @param depto en el body de la peticion vamos a recibir el departamento del dto q queremos modificar
     * @returns el nuevo departamento modificado
     */
    @Patch(':id_depto')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async updateDepto(
        @Param('id_depto') id_depto: number,
        @Body() depto: Partial<any>,
        @Req() req: any
    ) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservasService.send({cmd: 'update-depto'}, { id_depto, depto, role: userData.role});
    }


     /**
     * @description endpoint para eliminar un departamento segun su id
     * @param id el id del departamento q queremos eliminar
     * @returns un mensaje que el departamento fue eliminado correctamente
     */
    @Delete(':id_depto')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async deleteDepto(
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
        return this.reservasService.send({ cmd: 'delete-depto' }, { id_depto })
    }


     /**
     * @description endpoint para crear un departamento segun los parametros del dto
     * @param departamentoDto los valores del departamento dto 
     * @returns el nuevo departamento creado 
     */
    @Post()
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async createDepto(
        @Body() deptoDto: any,
        @Req() req: any
    ) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }
        return this.reservasService.send({ cmd: 'crear-depto' }, { deptoDto })
    };
}