import { Body, Controller, Delete, Get, Headers, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaginatorDto } from 'src/common';
import { handleControllerError } from 'src/common/errors';
import { PaginatedUser } from 'src/common/types';
import { AuthService } from './auth/auth.service';
import { CombineGuard } from './auth/guards/combine.guard';
import { Roles } from './auth/guards/role.decorator';
import { LoginDto } from './entity/loginDto';
import { Role } from './entity/user.entity';
import { UserDto } from './entity/userDto';
import { UsuarioService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
    //instanciamos el servicio para traer sus funcinoes
    constructor(private readonly service: UsuarioService,
        private readonly authService: AuthService
    ) { }

    /**
     * @description el endopoint para crear usuarios
     * @param usuario del body recibimos los valores del usuario para crearlo
     * @returns el usuario creado
     */
    @Post('register')
    //decoramos una variable con @Body, para que se comporte como tal, y un @Res, para usarlo en la respuesta
    async register(@Body() usuario: UserDto) {
        try {
            const result = await this.service.register(usuario);
            
            return result;
        } catch (error) {
            handleControllerError(error);
        }
        
    }

    /**
     * @description creamos el endopoint para logearse
     * @param credenciales las credenciales para logeearse correctamente
     * @returns retornamos el token crreado a partir de las credenciales
     */
    @Post('login')
    //creamos la logica para cuando nos logueamos, pidiendo en el body el user 
    async login(
        @Body() credenciales: LoginDto) {
        try {
            //creamos una constante usuario para almacenar los valores email y user q traemos del body y corroborar q sean correctos con el metodo validateUser del userService
            const token = await this.service.login(credenciales);
            //si el usuario no existe mandamos error
            if (!token) {
                throw new UnauthorizedException('credenciales invalidas')
            }
            //creamos una variable para almacenar y generar el token para poder mostrarlo y utilizarlo
            //respondemos q todo salio bien
            return token;
        } catch (error) {
            handleControllerError(error);
        }
    }


    /**
     * @description creamos el endpoint para obtener un usuario por su id
     * @param id 
     * @returns al usuario obtenido por su id
     */
    @Get(':id')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async obtenerUserPorId(@Param('id') id: number) {
        try {
            const user = await this.service.getUserById(id);
            return user;
        } catch (error) {
            handleControllerError(error);
        }
    }



    /**
     * @description obtenemos los usuarios sin una paginacion
     * @returns todos los usuarios creados 
     */
    @Get('all')
    @UseGuards(CombineGuard)
    @Roles(Role.CLIENT)
    async obtenerUsers() {
        try {
            const users = await this.service.getAllUsers();
            return users;
        } catch (error) {
            handleControllerError(error);
        }
    };


    /**
     * @description creamos el endpoint para obtener los usuarios mediante una paginacion
     * @param paginatorDto los parametros del paginador
     * @returns todos los usuarios creados mediante una paginacion
     */
    @Get()
    @Roles(Role.CLIENT)
    @UseGuards(CombineGuard)
    async obtenerUsuariosConPaginacion(@Query() params: PaginatorDto): Promise<PaginatedUser> {
        return this.service.getAllWithPagination(params);
    }



    /**
     * @description creamos un endpoint para eliminar un usuario
     * @param idUser el id del usuario q quermos eliminar
     * @returns un mensaje diciendo q el usuario fue elimnado correctamente
     */
    @Delete(':id')
    @Roles(Role.ADMIN)
    @UseGuards(CombineGuard)
    async eliminarUser(@Param('id') id: number) {
        try {
            const userEliminado = this.service.deleteUser(id);

            if (!userEliminado) throw new NotFoundException('User not found');

            return{msg: 'user eliminado correctamente',
                    userEliminado
                };
        } catch (error) {
            handleControllerError(error);
        }
    }


    /**
     * @description creamos un endpoint para buscar un usuario por su token
     * @param token el token obtenido
     * @param id el id del usuario
     * @returns el usuario obtenido por su token e id
     */
    @Get('token/:id')
    @Roles(Role.ADMIN)
    @UseGuards(CombineGuard)
    async getOne(
        @Headers('authorization') token: string,
        @Param('id', ParseIntPipe) id: number) {
        try {
            const splitString = token.split('Bearer '); //Bearer + ' ' + token
            const result = await this.service.getOne(id, splitString[1]);

            return result;
        } catch (error) {
            handleControllerError(error);
        }
    }



    /**
     * @description creamos el endpoint para actualizar un usuario
     * @param id 
     * @param user 
     * @param files 
     * @returns el usuario actualizado
     */
    @Patch(':id')
    @Roles(Role.ADMIN)
    @UseGuards(CombineGuard)
    @UseInterceptors(FilesInterceptor('files'))
    async updateUser(
        @Param('id_usuario') id_usuario: number,
        @Body() user: Partial<UserDto>,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        try {
            console.log(files);
            const result = await this.service.updateUser(id_usuario, user, files);

            return result;
        } catch (error) {
            handleControllerError(error);
        }
    }

    @Post('check-token')
    @UseGuards(CombineGuard)
    async checkToken(@Body('token') token: string): Promise<{ ok: boolean}> {
        return { ok: true}
    }

    @Post(':id/notificar')
    @UseGuards(CombineGuard)
    @Roles(Role.ADMIN)
    async notifiUser(@Param('id') id: number, @Body() notificacionData: any) {
        try {
            const result = await this.notifiUser(id, notificacionData);

            return {
                message: 'usuario notificado correctamente',
                result,
            }
        } catch (error) {
            handleControllerError(error);
        }
    }
}