import {
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import * as config from 'config';
import { Server } from 'socket.io';
import { socketRoomEnum } from './enum/socketRoom.enum';
import { IEmitClientInterface } from './interfaces/emitClient.interface';
import { LoggerService } from '../logger/services/logger.service';
import { LogErrorCodesEnum } from '../logger/enums/log-codes.enum';
import Redis from '../../../common/redis/abstract/redis.abstract';

const path: string = config.get('app.ws_path');

@WebSocketGateway({ path })
export class AppSocketServer implements OnGatewayDisconnect {
    @WebSocketServer()
    public server: Server;

    private readonly logger = this.loggerService.create();

    constructor(private readonly redis: Redis, private readonly loggerService: LoggerService) {}

    @SubscribeMessage('verify')
    public async import(client) {
        const { token } = client.handshake.query;
        try {
            const user = await this.redis.get(`$${token}`);

            if (user) {
                const { id } = JSON.parse(user);
                client.join(this.getUserRoom(id));
                client.join(socketRoomEnum.common);
            }

            return null;
        } catch (e) {
            this.logger
                .sub()
                .setError(e)
                .errorLog(
                    'Ошибка присоединения клиента к сокет-серверу',
                    LogErrorCodesEnum.SOCKET_SERVER_ERROR,
                );
        }
    }

    public async handleDisconnect(client) {
        try {
            const { token } = client.handshake.query;
            const user = await this.redis.get(`$${token}`);

            if (user) {
                const { id } = JSON.parse(user);
                client.leave(this.getUserRoom(id));
                client.leave(socketRoomEnum.common);
            }
        } catch (e) {
            this.logger
                .sub()
                .setError(e)
                .errorLog(
                    'Ошибка отключения клиента от сокет-сервера',
                    LogErrorCodesEnum.DISCONNECT_SOCKET_SERVER_ERROR,
                );
        }
    }

    public emitAllAuthUser(event: string, data = {}) {
        this.server.to('staff').emit(event, data);
    }

    public emitClient({ room, event, data = {} }: IEmitClientInterface) {
        this.server.to(room).emit(event, data);
    }

    public getUserRoom(userId: number): string {
        return `$user_${userId}`;
    }
}
