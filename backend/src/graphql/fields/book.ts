import {
    GraphQLBoolean,
    GraphQLFieldConfigMap,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import { GQLBook, GQLBookInp, GQLCategory } from '../types/book';
import {
    addBook,
    book,
    books,
    bookSearch,
    categories,
    subscribe,
    unsubscribe,
    tempBookAction
} from '../resolvers/book';

export const BookQueries: GraphQLFieldConfigMap<any, any> = {
    categories: {
        type: GraphQLList(GQLCategory),
        description: 'A list of categories',
        resolve: categories
    },
    book: {
        type: GQLBook,
        description: 'A single book',
        args: {
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => book(args.bookID)
    },
    bookSearch: {
        type: GraphQLList(GQLBook),
        description: 'A list of books whose titles have a match with query string',
        args: {
            query: { type: GraphQLNonNull(GraphQLString) },
            author: { type: GraphQLNonNull(GraphQLBoolean) },
            category: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => bookSearch(args.query, args.author, args.category)
    },
    // development
    books: {
        type: GraphQLList(GQLBook),
        description: 'A list of books',
        resolve: books
    }
};

export const BookMutations: GraphQLFieldConfigMap<any, any> = {
    subscribe: {
        type: GQLBook,
        description: 'Subscribes a user to a book',
        args: {
            bookID: { type: GraphQLNonNull(GraphQLString) },
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => subscribe(args.bookID, args.userID)
    },
    unsubscribe: {
        type: GQLBook,
        description: 'Unsubscribes a user to a book',
        args: {
            bookID: { type: GraphQLNonNull(GraphQLString) },
            userID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => unsubscribe(args.bookID, args.userID)
    },
    // development
    addBook: {
        type: GQLBook,
        description: 'Creates a new book',
        args: {
            bookInput: { type: GQLBookInp }
        },
        resolve: (_, args) => addBook(args.bookInput)
    },
    //temporary
    tempBookAction: {
        type: GraphQLList(GQLBook),
        description: 'Does some temporary action on book',
        resolve: tempBookAction
    }
};
