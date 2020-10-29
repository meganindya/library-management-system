import {
    GraphQLFieldConfigMap,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import { GQLUser, GQLUserAuth, GQLUserInp } from '../types/user';
import { addUser, login, user, users } from '../resolvers/user';

export const UserQueries: GraphQLFieldConfigMap<any, any> = {
    login: {
        type: GQLUserAuth,
        description: "An user's login data",
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            password: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => login(args.userID, args.password)
    },
    user: {
        type: GQLUser,
        description: 'A single user',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => user(args.userID)
    },
    users: {
        type: GraphQLList(GQLUser),
        description: 'A list of users',
        resolve: () => users()
    }
};

export const UserMutations: GraphQLFieldConfigMap<any, any> = {
    addUser: {
        type: GQLUser,
        description: 'This creates a new user',
        args: {
            userInput: { type: GQLUserInp }
        },
        resolve: (_, args) => addUser(args.userInput)
    }
};
