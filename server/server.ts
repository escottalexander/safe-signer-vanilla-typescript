import express, { Express } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { SafeSignerRequest } from './safeSigner';

export async function startServer(port: number = 3000): Promise<{ server: http.Server, app: Express }> {

    const app = express();
    const server = http.createServer(app);
    const io = new SocketIOServer(server);

    app.use(express.json());

    io.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('ready', () => {
            console.log('Client is ready');
            io.emit('clientReady');
        });

        socket.on('response', (response: string) => {
            io.emit('response', response);
        });

        socket.on('request', (request: SafeSignerRequest) => {
            io.emit('request', request);
        });

        socket.on('disconnect', () => {
            io.emit('clientDisconnected');
        });
    });

    return new Promise((resolve) => {
        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`);
            resolve({ server, app });
        });
    });
}
