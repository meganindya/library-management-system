import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLList
} from 'graphql';
import resolvers from '../resolvers/resolvers';

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
            resolve: (_, args) => resolvers.msg(args.id)
        },
        msgs: {
            type: GraphQLList(MsgType),
            resolve: () => resolvers.msgs()
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
            resolve: (_, args) => resolvers.addMsg(args.text)
        }
    })
});

const schema: GraphQLSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

export default schema;
