import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Payload } from 'src/config';

interface ClientInfo{
    socket: Socket;
    payload: Payload;
}
@Injectable()
export class SocketService {
    /**
     * @description
     * Almacenamos a los usuarios conectados
     */
    private clients: Record<string, ClientInfo> = {};


    /**
      * @description 
      * Almacenamos el socket del usuario, identificado x el id unico generado  
      */
    onConnection(socket: Socket, payload: Payload) {
        this.clients[socket.id] = { socket: socket, payload: payload };
    }



    /**
     * @description
     * una vez desconectado el cliente lo eliminamos de la lista
     */
    onDisconnect(socket: Socket) {
        console.log(`Usuario desconectado con id ${socket.id}`);
        delete this.clients[socket.id];
        console.log(this.clients);
    }

    /**
* @description
* Obtenemos un socket a traves del id del usuario
*/
    getSocket(id: number) {
        //* recorremos la lista dde objeto valor
        const client = Object.values(this.clients).find(c => c.payload.sub === id)
        return client || null;
        /**for (let key in this.clients) {
            //retornamos el valor
            console.log('el console log del socketService, dentro del getsocket', this.clients);
            if (this.clients[key].payload.sub == id) {
                return this.clients[key];
            }
            //y si no existe devolvemos nulo
            else return null;
        } */
    }
}