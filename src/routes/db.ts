import Router from '@koa/router';
import { ObjectID } from 'mongodb';

import { getClient } from '../db-client';

// ============================================================================

const router = new Router({
    prefix: '/db',
});

router
    .param('db', async (dbname, ctx, next) => {
        ctx.mongodb.db = (await getClient()).db(dbname);
        return next();
    })
    .param('collection', (collectionName, ctx, next) => {
        const { db } = ctx.mongodb;
        if (!db) throw new Error('NO DB FOUND');
        ctx.mongodb.collection = db.collection(collectionName);
        return next();
    })
    .param('_id', async (_id, ctx, next) => {
        const { collection } = ctx.mongodb;
        if (!collection) throw new Error('NO COLLECTION FOUND');
        ctx.mongodb.document = await collection.findOne({
            _id: new ObjectID(_id),
        });
        return next();
    })
    .get('/', async (ctx) => {
        // return nothing
        ctx.body = `Test`;
    })
    .get('/:db', async (ctx) => {
        ctx.body = (await ctx.mongodb.db?.stats()) ?? {};
    })
    .get('/:db/:collection', async (ctx) => {
        // return collection stats
        ctx.body = (await ctx.mongodb.collection?.stats()) ?? {};
    })
    .get('/:db/:collection/:_id', async (ctx) => {
        // return document
        if (ctx.mongodb.document) {
            // ctx.body = '111';
            ctx.body = ctx.mongodb.document;
        } else {
            ctx.status = 400;
            ctx.body = {
                message: 'No document found.',
            };
        }
    });

// ============================================================================

export default router;
