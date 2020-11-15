import { GraphQLFieldConfigMap, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { GQLAwaiting } from '../types/awaiting';
import { awaiting, awaitTransaction, clearAwaiting, confirmAwaiting } from '../resolvers/awaiting';

export const AwaitingQueries: GraphQLFieldConfigMap<any, any> = {
    awaiting: {
        type: GraphQLList(GQLAwaiting),
        description: 'A list of awaiting transactions for a user',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            type: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => awaiting(args.userID, args.type)
    }
};

export const AwaitingMutations: GraphQLFieldConfigMap<any, any> = {
    awaitTransaction: {
        type: GQLAwaiting,
        description: 'Creates a new awaiting borrow transaction record',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            bookID: { type: GraphQLNonNull(GraphQLString) },
            type: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => awaitTransaction(args.userID, args.bookID, args.type)
    },
    confirmAwaiting: {
        type: GQLAwaiting,
        description: 'Confirms the awaiting transaction',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => confirmAwaiting(args.userID, args.bookID)
    },
    clearAwaiting: {
        type: GQLAwaiting,
        description: 'Clears an awaiting transaction record',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => clearAwaiting(args.userID, args.bookID)
    }
};
