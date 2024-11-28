import { BadGatewayException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { RESERVAS_SERVICE } from "src/config";
import { CombineGuard } from "src/usuarios/auth/guards/combine.guard";
import { Roles } from "src/usuarios/auth/guards/role.decorator";
import { Role } from "src/usuarios/entity/user.entity";

@Controller('parcelas')
export class ParcelaController {
    constructor(
        @Inject(RESERVAS_SERVICE)
        private readonly reservasService: ClientProxy
    ) { }

    
    /**
     * @description endpoint para crear una parcela 
     * @param parcelaDto el dto de la parcela 
     * @returns la nueva parcela creada
     */
    @Post()
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async createParcela(
        @Body() parcelaDto: any, 
        @Req() req: any) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }
        
        parcelaDto.precio_base_parc = Number(parcelaDto.precio_base_parc);
        
        return this.reservasService.send({cmd: 'create-parcela'}, parcelaDto );
    }

    /**
     * @description endpoint para mostrar las parcelas creads
     * @returns todos las parcelas
     */
    @Get()
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async getParcela(@Req() req: any) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }
        return this.reservasService.send({ cmd: 'get-parcela' }, {})
    }


    /**
     * @description endpoinnt para mostrr una sola parcela
     * @param id_parcela el id de la parcela q queremos mostrar 
     * @returns la parcela filtrado x su id
     */
    @Get(':id_parcela')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async getParcelaById(@Param('id_parcela') id_parcela: number, @Req() req: any) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservasService.send({ cmd: 'find-parcela' }, { id_parcela })
    }


    /**
     * @description endpoint para actualizar un parcela
     * @param id_parcela el id de la parcela q queremos actualizar
     * @param parcela en el body de la peticion vamos a recibir la parcela del dto q queremos modificar
     * @returns la nueva parcela modificada
     */
    @Patch(':id_parcela')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async updateDepto(
        @Param('id_parcela') id_parcela: number,
        @Body() parcela: Partial<any>,
        @Req() req: any,) {
        const user = req.user;

        const userData = {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }
        return this.reservasService.send({ cmd: 'update-parcela' }, { id_parcela, parcela });
    }


    /**
     * @description endpoint para eliminar una parcela segun su id
     * @param id_parcela el id de la parcela q queremos eliminar
     * @returns un mensaje que la parcela fue eliminada correctamente
     */
    @Delete(':id_parcela')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async deleteDepto(@Param('id_parcela') id_parcela: number, @Req() req: any) {
        const user = req.user;

        const userData = { 
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            role: user.role
        }

        return this.reservasService.send({cmd: 'delete-parcela'}, id_parcela )
    }
}