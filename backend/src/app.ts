import express, { Application } from 'express';
import dotenv, { DotenvConfigOutput } from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema';
import mongoose from 'mongoose';
import { Client } from 'pg';

// load ENVIRONMENT VARIABLES
try {
    const configOutput: DotenvConfigOutput = dotenv.config();
    if (configOutput['error'] !== undefined || configOutput['parsed'] === undefined)
        throw new Error("cannot find databases' configuration file '.env'");
    console.log("databases' configuration file loaded");
} catch (err) {
    console.error(err);
}

// spawn express server
const app: Application = express();

// use JSON parse bodyParser middleware
app.use(express.json());

// avoid CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// handle /api path as graphQL endpoint
app.use('/api', graphqlHTTP({ schema: schema, graphiql: true }));

// connection for mongoDB Atlas database using mongoose
const mongoConnection = async () => {
    await mongoose.connect(
        // -- connection string for nodeJS 3.6 or later causes problems with mongoose
        // `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
        // -- connection string for nodeJS 2.2.12 works fine
        `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST_SHARD_0}:${process.env.MONGO_PORT},${process.env.MONGO_HOST_SHARD_1}:${process.env.MONGO_PORT},${process.env.MONGO_HOST_SHARD_2}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?ssl=true&replicaSet=atlas-7vq935-shard-0&authSource=admin&retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('connected to mongoDB server');
};

// connection for postgreSQL database
const postgresClient = new Client({
    connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
});
const postgresConnection = async () => {
    await postgresClient.connect();
    console.log('connected to postgreSQL server');
};

// listen (server) for connections if databases are successfully connected
(async () => {
    try {
        await Promise.all([mongoConnection(), postgresConnection()]);
        app.listen(process.env.PORT || 8000, () =>
            console.log(`listening on port ${process.env.PORT || 8000}`)
        );
    } catch (err) {
        console.error(err);
    }
})();

export default postgresClient;
