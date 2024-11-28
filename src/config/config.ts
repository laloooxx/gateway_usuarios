import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { envs } from './envs';

    
export const dbConfig : TypeOrmModuleOptions = {
    type: 'mysql',
    host: envs.host,
    port: envs.dbPort,
    username: envs.user,
    password: envs.password,
    database: envs.database,
    entities: [],
    autoLoadEntities: true, //carga las entities
    synchronize: true,//realiza las migraciones de las tablas automaticamente
    dropSchema: false,
    logging: true, // Proporciona más información sobre las operaciones de la base de datos.
    extra: {
        charset: 'utf8mb4_unicode_ci', //Establece el conjunto de caracteres correcto.
    }
}; 