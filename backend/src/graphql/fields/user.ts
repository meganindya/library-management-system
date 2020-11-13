import { GraphQLFieldConfigMap, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { GQLUser, GQLUserAuth, GQLUserInp } from '../types/user';
import { addUser, login, user, tempUserAction } from '../resolvers/user';

export const UserQueries: GraphQLFieldConfigMap<any, any> = {
    login: {
        type: GQLUserAuth,
        description: "A user's login data",
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
    }
};

export const UserMutations: GraphQLFieldConfigMap<any, any> = {
    // development
    addUser: {
        type: GQLUser,
        description: 'Creates a new user entry',
        args: {
            userInput: { type: GQLUserInp }
        },
        resolve: (_, args) => addUser(args.userInput)
    },
    // temporary
    tempUserAction: {
        type: GraphQLList(GQLUser),
        description: 'Does some temporary action on user',
        resolve: tempUserAction
    }
};
