import { startServer } from './server';
import { io, Socket } from 'socket.io-client';
import open from 'open';
import ViteExpress from "vite-express";
import { SignMessageParameters, SignTypedDataParameters, PrepareTransactionRequestParameters } from 'viem';

export type SafeSignerRequest = SignMessageParameters | SignTypedDataParameters | PrepareTransactionRequestParameters;

class SafeSigner {
  private socket!: Socket;
  private server: any;
  private clientReady: boolean = false;

  constructor(private port: number = 3000) { }

  async start(): Promise<void> {
    const { server, app } = await startServer(this.port);
    this.server = server;

    this.socket = io(`http://localhost:${this.port}`);

    this.socket.on('clientReady', () => {
      console.log('SafeSigner: Client is ready');
      this.clientReady = true;
    });

    this.socket.on('clientDisconnected', () => {
      console.log('SafeSigner: Client disconnected');
      this.clientReady = false;
    });

    // Defining routes here so we have access to the class methods
    app.post('/api/submit-request', (req, res) => {
      const request: SafeSignerRequest = req.body;

      // Wait for the response and send it back to the client
      this.sendRequest(request).then((response) => {
        res.json(response);
      }).catch((error) => {
        res.status(500).json({ error: error.message });
      });
    });

    // New endpoint for checking client status
    app.get('/api/client-status', (_, res) => {
      const clientConnected = this.clientReady;
      res.json({ clientConnected });
    });

    app.get('/api/stop', (_, res) => {
      this.stop();
      res.json({ message: 'Server stopped' });
    });

    // Start front end
    const mode = process.env.NODE_ENV !== 'production' ? 'development' : 'production';
    ViteExpress.config({ mode });
    await ViteExpress.bind(app, server, () => { console.log(`> Ready on http://localhost:${this.port}`); });
    
    await open(`http://localhost:${this.port}`, { wait: true, background: true});
  }

  async sendRequest(request: SafeSignerRequest): Promise<string> {
    return new Promise((resolve) => {
      // Wait until the client is ready
      const checkReady = setInterval(() => {
        if (this.clientReady) {
          clearInterval(checkReady);
          this.socket.emit('request', request);
          this.socket.once('response', resolve);
        }
      }, 100); // Check every 100ms
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    process.exit(0);
  }
}

export default SafeSigner;