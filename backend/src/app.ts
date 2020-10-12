import express, { Application, Request, Response, NextFunction } from 'express';
import { graphqlHTTP } from 'express-graphql';
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLList
} from 'graphql';
import { argsToArgsConfig } from 'graphql/type/definition';

const app: Application = express();

app.use(express.json());

interface Message {
    id: number;
    text: string;
}

let msgs: Message[] = [];

const MsgType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Message',
    description: 'This represents a message',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        text: { type: GraphQLNonNull(GraphQLString) }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        msg: {
            type: MsgType,
            description: 'A single message',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => msgs.find((msg) => msg.id === args.id)
        },
        msgs: {
            type: GraphQLList(MsgType),
            resolve: () => msgs
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addMsg: {
            type: MsgType,
            args: {
                text: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const msg = { id: msgs.length + 1, text: args.text };
                msgs.push(msg);
                return msg;
            }
        }
    })
});

app.use(
    '/graphql',
    graphqlHTTP({
        schema: new GraphQLSchema({
            query: RootQueryType,
            mutation: RootMutationType
        }),
        graphiql: true
    })
);

app.listen(process.env.PORT || 8000);
