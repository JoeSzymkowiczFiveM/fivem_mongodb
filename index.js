const { MongoClient } = require("mongodb");
const utils = require("./utils");

const convars = {};
let missingConvars;

convars.url = GetConvar('mongodb_url', '').replace(/'/g, "");
convars.db = GetConvar('mongodb_db', '').replace(/'/g, "");

let db = null;
let isServerConnected = false;

const connectToDatabase = async () => {
    const client = new MongoClient(convars.url, {connectTimeoutMS: 10000});
    try {
        await client.connect();
        db = client.db(convars.db);
        
        console.log(`[^2MongoDB^7] Connected to database "${convars.db}".`);
        isServerConnected = true;
        emit("onDatabaseConnect", convars.db);
    } catch(err) {
        console.log("[^2MongoDB^7][^1ERROR^7] " + err.message + ". Retrying connection.");
        await connectToDatabase();
        return;
    }
};

const checkDatabaseReady = () => {
    if (isServerConnected) {
        return true;
    }
    console.error("[^2MongoDB^7][^1ERROR^7] Database is not connected.");
    return false;
}

const checkParams = (params) => {
    return params !== null && typeof params === 'object';
}

const getParamsCollection = (params) => {
    if (!params.collection) return;
    return db.collection(params.collection);
}

/* MongoDB methods wrappers */

/**
 * MongoDB insert method
 * @param {Object} params - Params object
 * @param {Array}  params.documents - An array of documents to insert.
 * @param {Object} params.options - Options passed to insert.
 */
exports('insert', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Invalid collection "${params.collection}"`);

    let documents = params.documents;
    if (!documents || !Array.isArray(documents))
        return console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Invalid 'params.documents' value. Expected object or array of objects.`);

    const options = utils.safeObjectArgument(params.options);
    try {
        let insertResult = await collection.insertMany(documents, options)
        let arrayOfIds = [];
        for (let key in insertResult.insertedIds) {
            if (insertResult.insertedIds.hasOwnProperty(key)) {
                arrayOfIds[parseInt(key)] = insertResult.insertedIds[key].toString();
            }
        };
        const result = {'insertedCount': insertResult.insertedCount, 'insertedIds': arrayOfIds};
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB insertOne method
 * @param {Object} params - Params object
 * @param {Array}  params.document - An array of documents to insert.
 * @param {Object} params.options - Options passed to insert.
 */
exports('insertOne', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Invalid params object.`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Invalid collection "${params.collection}"`);

    const document = utils.safeObjectArgument(params.document);
    const options = utils.safeObjectArgument(params.options);
    try {
        const insertResult = await collection.insertOne(document, options);
        const result = insertResult.insertedId.toString()
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.insert: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB find method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 * @param {Object} params.sort - Sort returned documents.
 * @param {number} params.limit - Limit documents count.
 */
exports('find', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.find: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.find: Invalid collection "${params.collection}"`);
    if (params.limit && Number(params.limit) === NaN) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.find: Invalid limit amount "${params.limit}"`)


    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);
    try {
        let findResult = await collection.find(query, options);
        if (params.sort) findResult = findResult.sort(params.sort);
        if (params.limit) findResult = findResult.limit(params.limit);
        const documents = await findResult.toArray();
        const result = utils.exportDocuments(documents)
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.find: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB findOne method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 * @param {Object} params.sort - Sort returned documents.
 */
exports('findOne', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOne: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOne: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);
    const sort = utils.safeObjectArgument(params.sort);
    
    try {
        let findOneresult = await collection.findOne(query, options);
        if (params.sort) findOneresult = findOneresult.sort(sort);
        // const documents = await result.toArray();
        // result ? result : result = []
        const result = utils.exportDocument(findOneresult)
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOne: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB update method
 * @param {Object} params - Params object
 * @param {Object} params.query - Filter query object.
 * @param {Object} params.update - Update query object.
 * @param {Object} params.options - Options passed to insert.
 */
exports('update', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.update: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.update: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const update = utils.safeObjectArgument(params.update);
    const options = utils.safeObjectArgument(params.options);
    try {
        const result = await collection.updateMany(query, update, options);
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.update: Error "${err.message}".`, params);
        return err.message
    }
})

/**
 * MongoDB updateOne method
 * @param {Object} params - Params object
 * @param {Object} params.query - Filter query object.
 * @param {Object} params.update - Update query object.
 * @param {Object} params.options - Options passed to insert.
 */
exports('updateOne', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.updateOne: Invalid params object.`);
    if (!params.collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.updateOne: Invalid collection "${params.collection}"`);

    const collection = getParamsCollection(params);    
    const query = utils.safeObjectArgument(params.query);
    const update = utils.safeObjectArgument(params.update);
    const options = utils.safeObjectArgument(params.options);
    
    try {
        const result = await collection.updateOne(query, update, options);
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.updateOne: Error "${err.message}".`, params);
        return err.message
    }
})

/**
 * MongoDB count method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
exports('count', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.count: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.count: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);
    try {
        const result = await collection.countDocuments(query, options)
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.count: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB delete method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
exports('deleteOne', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.deleteOne: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.deleteOne: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);
    try {
        const result = await collection.deleteOne(query, options);
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.deleteOne: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB deleteMany method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
exports('deleteMany', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.delete: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.delete: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);
    try {
        const result = await collection.deleteMany(query, options);
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.delete: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB aggregate method
 * @param {Object} params - Params object
 * @param {Object} params.pipeline - Pipeline object.
 * @param {Object} params.options .
 */
exports('aggregate', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.aggregate: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.aggregate: Invalid collection "${params.collection}"`);

    const options = utils.safeObjectArgument(params.options);
    const pipeline = Array.isArray(params.pipeline) ? params.pipeline : [params.pipeline]

    try {
        const result = await collection.aggregate(pipeline, options).toArray();
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.aggregate: Error "${err.message}".`);
        return err.message
    }
})

/**
 * MongoDB find one and update method
 * @param {Object} params - Params object
 * @param {Object} params.query - Filter query object.
 * @param {Object} params.update - Update query object.
 * @param {Object} params.options - Options.
 */
exports('findOneAndUpdate', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOneAndUpdate: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOneAndUpdate: Invalid collection "${params.collection}"`);

    const query = utils.safeObjectArgument(params.query);
    const update = utils.safeObjectArgument(params.update);
    const options = utils.safeObjectArgument(params.options);

    try {
        const findResult = await collection.findOneAndUpdate(query, update, options);
        const result = utils.exportDocument(findResult)
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOneAndUpdate: Error "${err.message}".`);
        return err.message;
    }
})

/**
 * MongoDB createIndex method
 * @param {Object} params - Params object
 */
exports('createIndex', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.createIndex: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.createIndex: params.collection is required`);

    try {
        await collection.createIndex(params.keys, params.options)
        return cb ? cb(true) : true;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.createIndex: Error "${err}".`);
        return err
    }
})

/**
 * MongoDB getIndex method
 * @param {Object} params - Params object
 */
exports('listIndexes', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.listIndexes: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.listIndexes: params.collection is required`);

    try {
        const result = await collection.listIndexes()
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.listIndexes: Error "${err}".`);
        return err
    }
})

/**
 * MongoDB dbBulkWrite method
 * @param {Object} params - Params object
 * @param {Object} params.operations - Operations to be performed.
 */
exports('bulkWrite', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.bulkWrite: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.bulkWrite: Invalid collection "${params.collection}"`);

    try {
        const writeResult = await collection.bulkWrite(params.operations);
        const result = utils.bulkWriteResultsParser(writeResult)
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.bulkWrite: Error "${err.message}".`);
        return err.message;
    }
})

/**
 * MongoDB find one and update method
 * @param {Object} params - Params object
 * @param {Object} params.filter - Filter query object.
 * @param {Object} params.options - Options.
 */
exports('findOneAndDelete', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOneAndDelete: Invalid params object.`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.findOneAndDelete: Invalid collection "${params.collection}"`);

    const filter = utils.safeObjectArgument(params.filter);
    const options = utils.safeObjectArgument(params.options);

    try {
        const findOneResult = await collection.findOneAndDelete(filter, options);
        const result = utils.exportDocument(findOneResult)
        return cb ? cb(result) : result;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.getCollection: Error "${err.message}".`);
        return err.message;
    }
})

/**
 * MongoDB verify a collection exists
 * @param {Object} params - Params object
 */
exports('createCollection', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.createCollection: Invalid params object.`);

    try {
        await db.createCollection(params.collection)
        return cb ? cb(true) : true;
    } catch (err) {
        console.log(`[^2MongoDB^7][^1ERROR^7] exports.createCollection: Error "${err.message}".`);
        return err.message;
    }
})

exports('getCollection', async (params, cb) => {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`[^2MongoDB^7][^1ERROR^7] exports.getCollection: Invalid params object.`);

    const result = getParamsCollection(params);
    return cb ? cb(result) : result;
})

exports('isConnected', async () => {
    return !!isServerConnected;
})

for (const [key, value] of Object.entries(convars)) {
    if (value === '') {
        console.log(`[^2MongoDB^7][^1ERROR^7] Convar "mongodb_${key}" not set (see README)`);
        missingConvars = true;
    };
};

if (!missingConvars) {
    connectToDatabase();
};