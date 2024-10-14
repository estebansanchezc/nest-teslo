import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    //console.log(client);
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    console.log({ token });
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    console.log({ payload });

    //this.messagesWsService.registerClient(client);

    this.wss.emit(
      'clients-updates',
      this.messagesWsService.getConnectedClient(),
    );
    //console.log({ conectados: this.messagesWsService.getConnectedClient() });
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updates',
      this.messagesWsService.getConnectedClient(),
    );

    //console.log({ conectados: this.messagesWsService.getConnectedClient() });
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //emite unicamente al ciente.
    // client.emit('messages-from-server', {
    //   fullName: 'soy yo',
    //   message: payload.message || 'no message',
    // });

    //emite a todos MENOS, al cliente inicial
    // client.broadcast.emit('messages-from-server', {
    //   fullName: 'soy yo',
    //   message: payload.message || 'no message',
    // });

    //mensaje para todos incluso para el cliente que genero el mensaje
    this.wss.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'no message',
    });
  }
}
