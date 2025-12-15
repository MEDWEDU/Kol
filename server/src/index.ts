import 'dotenv/config';

import { createServer } from 'http';
import { createApp } from './app';
import { connectMongo } from './db/mongo';
import { initializeSocketIO } from './services/socket';

const port = Number(process.env.PORT ?? 5000);
const app = createApp();
const httpServer = createServer(app);
initializeSocketIO(httpServer);

connectMongo()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`[server] listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('[server] failed to connect to MongoDB', err);
    process.exit(1);
  });
