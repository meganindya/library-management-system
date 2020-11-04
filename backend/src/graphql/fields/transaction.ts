import {
    GraphQLFieldConfigMap,
    GraphQLList,
    GraphQLNonNull,
    GraphQLScalarType,
    GraphQLString
} from 'graphql';
import { GQLTransaction } from '../types/transaction';
import {
    borrowBook,
    outstanding,
    pending,
    returnBook,
    transactions
} from '../resolvers/transaction';

export const TransactionQueries: GraphQLFieldConfigMap<any, any> = {
    transactions: {
        type: GraphQLList(GQLTransaction),
        description: 'A list of transactions for a user',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => transactions(args.userID)
    },
    pending: {
        type: GraphQLList(GQLTransaction),
        description: 'A list of pending transactions',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => pending(args.userID)
    },
    outstanding: {
        type: GraphQLList(GQLTransaction),
        description: 'A list of outstanding transactions',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => outstanding(args.userID)
    }
};

export const TransactionMutations: GraphQLFieldConfigMap<any, any> = {
    borrowBook: {
        type: GQLTransaction,
        description: 'This opens a transaction record',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => borrowBook(args.userID, args.bookID)
    },
    returnBook: {
        type: GQLTransaction,
        description: 'This closes a transaction record',
        args: {
            transID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => returnBook(args.transID)
    }
};
