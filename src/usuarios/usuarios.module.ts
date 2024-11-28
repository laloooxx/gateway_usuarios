import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RESERVAS_SERVICE } from 'src/config';
import { DepartamentoController } from 'src/departamentos_microservicio/departamento.controller';
import { ReservasController } from 'src/departamentos_microservicio/reservas.controller';
import { ParcelaController } from 'src/parcelas_microservicio/parcela.controller';
import { RegistroParcelas } from 'src/parcelas_microservicio/registro.controller';
import { AuthService } from 'src/usuarios/auth/auth.service';
import { CombineGuard } from './auth/guards/combine.guard';
import { JwtGuard } from './auth/guards/jwt.guard.auth';
import { RolesGuard } from './auth/guards/role.guard';
import { JWTStrategy } from './auth/middleware/jwt/jwt.strategy';
import { UsuarioEntity } from './entity/user.entity';
import { saveImagesToStorage } from './helpers/image-storage';
import { UsuariosController } from './usuarios.controller';
import { UsuarioService } from './usuarios.service';

@Module({
  //aca poniendo forFeature le decimos q solo se va usar aca, va a encapusalrse
  imports: [TypeOrmModule.forFeature([UsuarioEntity]),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SEED'),
      signOptions: {
        expiresIn: '24h'
      }
    })
  })
    ,
  //definimos el modulo de multer q es para la carga de archivos
  MulterModule.register({
    dest: './uploads',
    fileFilter: saveImagesToStorage('avatar').fileFilter,
    storage: saveImagesToStorage('avatar').storage,
  }),
  ClientsModule.register([
    {
      name: RESERVAS_SERVICE,
      transport: Transport.TCP,
      options: {
        port: 3000, //debe ir el puerto al cual se va a conectar, NO el puerto actual donde corre este ms
        host: 'localhost',
      }
    }
  ])
  ],
  controllers: [UsuariosController, DepartamentoController, ReservasController, ParcelaController, RegistroParcelas],
  providers: [UsuarioService, AuthService, JWTStrategy,RolesGuard, JwtGuard, CombineGuard],
  exports: [UsuarioService, AuthService, RolesGuard, CombineGuard]
})
export class UsuariosModule { }
