import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/usuarios/auth/auth.service';
import { SocketService } from './socket.service';

//*recuerden que los decoradores manipulan el compartamiento de una clase, variable,función, etc
@WebSocketGateway()
//*lo q realizamos  es implementar una interface en la misma clase , llamada OnmoduleInit q trae consigo la funcion q se ejecuta al iniciar el modulo q en este caso es el gateway
export class SocketGateway implements OnModuleInit {
  constructor(
    //inyectamos los servicios en el constructor para poder utilizarlos en todo lados
    private readonly socketService: SocketService,
    private readonly auth: AuthService,
  ) { }
  @WebSocketServer()
  //creamos una variable que controle el flujo del server
  server: Server;
  /**
   * @description
   * Almacenamos los usuarios conectados en una lista
   */


  //cada vez que se inicie el módulo, escuche los eventos de conexión al socket
  onModuleInit() {
    this.server.on('connection', async (socket: Socket) => {
      try {
        //verificamos el token para obtener la informacion
        const payload = await this.auth.verifyJWT(
          socket.handshake.headers.authorization,
        );

        console.log(
          `Usuario conectado con el id: ${socket.id}`,
          socket.handshake.headers['users'],
          console.log('el console log del onmoduleinit ', socket.handshake.headers)
        );

        //*le mandamos un msj de bienvenida al usuario cuando se conecte al gateway
        this.server.emit(
          'welcome-message',
          `Bienvenido al servidor, usuario ${socket.id}`
        );

        //mandamos la informacion del usuario al servicio
        this.socketService.onConnection(socket, payload);



        //const socketUser = this.socketService.getSocket(
        //  +socket.handshake.headers['users'],);
        const socketUser = this.socketService.getSocket(payload.sub);
        
        if (socketUser) {
          socketUser.socket.emit(
            `El usuario ${payload.nombre} establecio una conexion con el servidor`
          )
        }

        socket.on('disconnect', () => {
          console.log(`Usuario desconectado con id ${socket.id}`);
          //hacemos q si se desconecte se elimine d la lista
          this.socketService.onDisconnect(socket);
        })
      } catch (error) {
        socket.emit('error', 'Información de autenticación incorrecta');

        socket.disconnect();
      }
    });
  }
}