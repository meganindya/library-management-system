import { GraphQLFieldConfigMap, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { GQLTransaction } from '../types/transaction';
import {
    borrowBook,
    outstanding,
    pending,
    returnBook,
    transactions,
    tempTransactionAction
} from '../resolvers/transaction';

export const TransactionQueries: GraphQLFieldConfigMap<any, any> = {
    transactions: {
        type: GraphQLList(GQLTransaction),
        description: 'A list of all transactions for a user',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => transactions(args.userID)
    },
    pending: {
        type: GraphQLList(GQLTransaction),
        description: 'A list of pending transactions for a user',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => pending(args.userID)
    },
    outstanding: {
        type: GraphQLList(GQLTransaction),
        description: 'A list of outstanding transactions for a user',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => outstanding(args.userID)
    }
};

export const TransactionMutations: GraphQLFieldConfigMap<any, any> = {
    borrowBook: {
        type: GQLTransaction,
        description: 'Opens a transaction record',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => borrowBook(args.userID, args.bookID)
    },
    returnBook: {
        type: GQLTransaction,
        description: 'Closes a transaction record',
        args: {
            userID: { type: GraphQLNonNull(GraphQLString) },
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => returnBook(args.userID, args.bookID)
    },
    // temporary
    tempTransactionAction: {
        type: GraphQLList(GQLTransaction),
        description: 'Does some temporary transaction action',
        resolve: tempTransactionAction
    }
};
