import { MongoClient } from 'mongodb';

import readSecret from './utils/read-secret';

// ============================================================================

export let client: MongoClient;

// ============================================================================

async function getDbUrl(): Promise<string> {
    const USERNAME = await readSecret('MONGO_INITDB_ROOT_USERNAME_FILE');
    const PASSWORD = await readSecret('MONGO_INITDB_ROOT_PASSWORD_FILE');

    const url =
        'mongodb://' +
        `${USERNAME}:${PASSWORD}` +
        '@host.docker.internal:27017';

    return url;
}
export async function getClient(url?: string): Promise<MongoClient> {
    if (client) return client;

    const uri =
        url ?? (await getDbUrl()) + '?retryWrites=true&writeConcern=majority';

    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();

    return client;
}

// ============================================================================

// Exit handler
function exitHandler() {
    try {
        Promise.all(
            [client].map((client) => {
                if (client.isConnected()) return client.close(false);
                return new Promise<void>((resolve) => resolve());
            })
        ).then(() => {
            // eslint-disable-next-line no-console
            console.log(`MongoDB client close successfully!`);
            process.exit(0);
        });
    } catch (e) {
        if (process) process.exit(0);
    }
}
process.on('exit', exitHandler);
// catches ctrl+c event
process.on('SIGINT', exitHandler);
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
// catches uncaught exceptions
process.on('uncaughtException', exitHandler);
