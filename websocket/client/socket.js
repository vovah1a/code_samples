import io from 'socket.io-client';
import { WS_HOST, WS_PATH } from 'config';

const socketInitObject = {
    /* eslint-disable */
    on: () => console.log('sockets are not connected'),
    emit: () => console.log('sockets are not connected'),
    /* eslint-enable */
};
let socket = socketInitObject;

const socketInit = () => {
    socket = io(WS_HOST, {
        transports: ['websocket'],
        path: WS_PATH,
        query: {
            token: localStorage.getItem('token'),
        },
    });
};

const socketClose = () => {
    if (socket.close) {
        socket.close();
    }

    socket = socketInitObject;
};

const getSocket = () => socket;

export { socketInit, getSocket, socketClose };
