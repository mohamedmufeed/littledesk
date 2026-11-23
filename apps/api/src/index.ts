import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { createServer } from './server.js';

async function bootstrap() {
  await connectDB();

  const app = createServer();
  app.listen(ENV.PORT, () => {
    console.log(`[LittleDesk API] Server listening on http://localhost:${ENV.PORT}`);
    console.log(`[LittleDesk API] Environment: ${ENV.NODE_ENV}`);
  });
}

bootstrap().catch((err) => {
  console.error('[LittleDesk API] Bootstrap fatal error:', err);
  process.exit(1);
});
