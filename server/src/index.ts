import 'dotenv/config';

import { createApp } from './app';
import { connectMongo } from './db/mongo';

const port = Number(process.env.PORT ?? 5000);
const app = createApp();

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`[server] listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('[server] failed to connect to MongoDB', err);
    process.exit(1);
  });
