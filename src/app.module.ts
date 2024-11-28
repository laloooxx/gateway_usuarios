import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/config';
import { SocketModule } from './socket/socket.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [UsuariosModule,
    //Las configuraciones d este modulo ahora son globales y abarcan toda la app
    ConfigModule.forRoot({ isGlobal: true
     }),
    TypeOrmModule.forRoot(dbConfig),
    SocketModule,
  ],
  controllers: [],
  providers: [
  ],
})

export class AppModule{}

