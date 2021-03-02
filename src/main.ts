/* eslint-disable no-console */
import Koa from 'koa';
import helmet from 'koa-helmet';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { Db, Collection } from 'mongodb';

import { getClient } from './db-client';
import routerDb from './routes/db';

// ============================================================================

declare module 'koa' {
    interface BaseContext {
        mongodb: {
            db?: Db;
            collection?: Collection;
            document?: any;
        };
    }
}

// ============================================================================

export const router = new Router();

// ============================================================================

async function run(): Promise<void> {
    const __DEV__ = process.env.NODE_ENV === 'development';
    const port = __DEV__ ? 3017 : 9017;

    await getClient().catch((e) => console.error(e));

    const app = new Koa();

    app.use(helmet());

    // 添加 mongodb ctx
    app.use(async (ctx, next) => {
        ctx.mongodb = {};
        await next();
    });

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            // will only respond with JSON
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message,
            };
        }
    });

    app.listen(port);

    if (__DEV__) console.log(`Listening port ${port}`);
}

// ============================================================================

router.use(routerDb.routes());
router.get('/', async (ctx) => {
    ctx.body = `Nothing here`;
});

// ============================================================================

run();
