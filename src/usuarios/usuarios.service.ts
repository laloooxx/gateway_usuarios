import { forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatorDto } from 'src/common';
import { handleServiceError } from 'src/common/errors';
import { formatPage, formatTake, MAX_TAKE_PER_QUERY } from 'src/common/pagination.helper';
import { Metadata, PaginatedUser } from 'src/common/types';
import { AuthService } from 'src/usuarios/auth/auth.service';
import { Repository } from 'typeorm';
import { LoginDto } from './entity/loginDto';
import { UsuarioEntity } from './entity/user.entity';
import { UserDto } from './entity/userDto';

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(UsuarioEntity)
        private readonly repo: Repository<UsuarioEntity>,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,

        @Inject('sistema_reservas')
        private readonly proxyReservas: ClientProxy,
    ) { }

    /**
     * @description va a devolver todos lo usuarios q tengamos en la base de datos
     * @returns la lista de usuarios
     */
    async getAllUsers(): Promise<UserDto[]> {
        try {
            const users = this.repo.find();

            if (!users) {
                throw new NotFoundException('Usuarios no encontrados')
            }

            if ((await users).length === 0) {
                throw new NotFoundException('Usuarios no existentes')
            }

            return users;
        } catch (error) {
            handleServiceError(error);
        }
    }

    /**
     * @description funcion para mostrar usuarios mediante una paginacion
     * @param pagainadorDto  
     * @returns los usuarios en una lista bien estructuraada
     */
    async getAllWithPagination(query: PaginatorDto): Promise<PaginatedUser> {
        //determina cuantos elemntos traer, usa formatTake para asegurar un valor valido
        const take = formatTake(query.take || MAX_TAKE_PER_QUERY.toString())
        //determina q pagina traer, usa formatPage para asegurar un valor valido
        const page = formatPage(query.page || '1');
        //calcula cuantos elemenntos saltear basado en la pagina y en el numero de elements x pagina
        const skip = (page - 1) * take;


        //creamos la consulta sql
        const queryBuilder = this.repo.createQueryBuilder('user');
        //usamos el query.search, asi q usamos el where para filtrar x nombre
        if (query.search) {
            queryBuilder.where(
                //la busqueda es case-insensitive gracias al lower
                'LOWER(user.nombre) LIKE LOWER(:search)', { search: `%${query.search}%` }
            )
        }

        //ejecutamos la consulta
        const [rows, count] = await queryBuilder
            //limitamos el numero de resultados
            .take(take)
            //salteamos los resultados de las paginas anteriores
            .skip(skip)
            //ejecutamos la consulta y devolvemos tanto los resultados como el conteo total
            .getManyAndCount()

        //calculamos el total de paginas dividiendo el total de items por los items x pagina
        const totalPages = Math.ceil(count / take);
        //y determinamos si hay una pagina siguiente
        const nextPage = page < totalPages ? page + 1 : null;

        //creamos un objeto con toda laa informacion de la paginacion 
        const metadata: Metadata = {
            itemsPerPage: take,
            totalPages,
            totalItems: count,
            currentPage: page,
            nextPage,
            searchTerm: query.search || ''
        }

        //y devolvemos los resultados (rows) y los metadatos
        return { rows, metadata }
    }

    /**
     * @description eliminamos un usuario filtrando x id
     * @param id 
     * @returns retorna la lista de usuarios sin el nuevo usuario si todo salio bien
     */
    async deleteUser(id: number): Promise<any> {
        try {
            const user = await this.repo.delete(id);

            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            await this.proxyReservas.emit('delete-user-reservas', id)
            return user;
        } catch (error) {
            handleServiceError(error);
        }
    }


    /**
     * @description creamos una funcion para registarr un usuario y hashear la contraseña una vez registrado
     * @param usuario userDto
     * @returns el usuario creado
     */
    async register(usuario: UserDto) {
        try {
            if (!usuario.password) throw new UnauthorizedException('No Password');

            const hash = await this.authService.hashPassword(usuario.password);
            usuario.password = hash;

            const result = await this.repo.save(usuario);
            
            return result;
        } catch (err: any) {
            handleServiceError(err);
        }
    }

    /**
     * @description creamos una funcion q encuentra un usuario x el id
     * @param id ID del usuario
     * @returns retorna un usuario del userDto o un error
     */
    async getUserById(id: number): Promise<UserDto> {
        try {
            const user = this.repo.findOne({ where: { id } });

            if (!user) throw new NotFoundException('Usuario no encontrado');
            return user;
        } catch (error) {
            handleServiceError(error);
        }
    }

    /**
     * @description funcion para buscar un solo usuario x el token
     * @param id id del usuario q queremos buscar
     * @param token recibimo el token 
     * @returns el usuario encontrado o un error
     */
    async getOne(id: number, token?: string): Promise<UserDto> {
        try {
            const decodedUser = await this.authService.verifyJWT(token);
            const usuario = await this.repo.findOne({
                where: { id: decodedUser }
            })
            return usuario;
        } catch (error) {
            handleServiceError(error);
        }
    }


    /**
     * @description funcion para logear al usuario 
     * @param credenciales las credenciales para logearse, el email y password
     * @returns el token creado con las credenciales
     */
    async login(credenciales: LoginDto) {
        try {
            const { email, password } = credenciales;
            const user = await this.repo.findOne({ where: { email: email } });

            if (!user) {
                throw new NotFoundException('Usuario no encontrado')
            }

            const contraseña = await this.authService.comparePassword(password, user.password);

            if (!contraseña) {
                throw new NotFoundException('contraseña incorrecta')
            };

            const token = await this.authService.generateToken(user);

            return token;
        } catch (err) {
            handleServiceError(err);
        }
    }


    /**
     * @description  recibimos como parametro el id del usuario, un objeto parcial del user dto (xq no sabemos si vamos a cambiar todo el usuario, x eso es parcial) y llos archivos q interceptamos, para actualizar el usuario
     * @param id_usuario el id del usuario q queremos modificar
     * @param user el dto del usuario q queremos modificar
     * @param files el archivo q vamos a meter
     * @returns el usuario con la actualización de datos
     */
    async updateUser(
        id_usuario: number,
        user: Partial<UserDto>,
        files: Express.Multer.File[],
    ) {
        try {
            //buscamos al usuario en la bd
            const oldUser = await this.getUserById(id_usuario);

            if (!oldUser) {
                throw new NotFoundException(`User ${id_usuario} not found`);
            }

            if (files.length > 0) {
                user.avatar = files[0].filename;
            }

            //y combinamos al usuario q teniamos en la bd con los datos q acabamos de traer para crear un "user nuevo"
            const mergeUser = await this.repo.merge(oldUser, user);

            const result = await this.repo.save(mergeUser);

            return result;

        } catch (err) {
            handleServiceError(err);
        }
    }

    async notifyUser(userId: any, notificacionData: any) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                throw new NotFoundException(`El usuario con ID ${userId} no existe o no se encontró`)
            }

            const notificacionPayload = {
                email: user.email,
                ...notificacionData
            }

            console.log(`Enviando notificación a ${user.email}`, notificacionPayload);

            return {
                status: 'success',
                user: user.email,
                payload: notificacionPayload
            }
        } catch (error) {
            console.error(error);
            handleServiceError(error);
        }
    }
}
