import express, { Application, Request, Response, NextFunction } from 'express';
import { graphqlHTTP } from 'express-graphql';
import schema from './graphql/schema/schema';
import mongoose from 'mongoose';

require('dotenv').config(); // load ENVIRONMENT VARIABLES

// spawn express server
const app: Application = express();

// use JSON parse bodyParser middleware
app.use(express.json());

// handle /api path as graphQL endpoint
app.use('/api', graphqlHTTP({ schema: schema, graphiql: true }));

// connect to mongoDB Atlas database using mongoose
mongoose
    .connect(
        `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-shard-00-00.snhzr.mongodb.net:27017,cluster0-shard-00-01.snhzr.mongodb.net:27017,cluster0-shard-00-02.snhzr.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=atlas-7vq935-shard-0&authSource=admin&retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() =>
        app.listen(process.env.PORT || 8000, () =>
            console.log(`listening on port ${process.env.PORT || 8000}`)
        )
    )
    .catch((err) => console.error(err));

// app.listen(process.env.PORT || 8000, () =>
//     console.log(`listening on port ${process.env.PORT || 8000}`)
// );
