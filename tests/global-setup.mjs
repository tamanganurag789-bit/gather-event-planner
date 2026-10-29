import { createTestServer } from './serve.mjs';

export default async function startTestServer() {
  const server = createTestServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(4174, '127.0.0.1', resolve);
  });

  return async function stopTestServer() {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  };
}
