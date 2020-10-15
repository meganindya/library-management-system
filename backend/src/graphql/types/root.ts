import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { GQLUser, GQLUserInp } from './user';
import { addUser, user, users } from '../resolvers/user';

export const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        user: {
            type: GQLUser,
            description: 'A single user',
            args: {
                userID: { type: GraphQLString }
            },
            resolve: (_, args) => user(args.userID)
        },
        users: {
            type: GraphQLList(GQLUser),
            description: 'A list of users',
            resolve: () => users()
        }
    })
});

export const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addUser: {
            type: GQLUser,
            description: 'This creates a new user',
            args: {
                input: { type: GQLUserInp }
            },
            resolve: (_, args) => addUser(args.input)
        }
    })
});
