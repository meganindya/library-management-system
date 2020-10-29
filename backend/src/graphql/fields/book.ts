import {
    GraphQLFieldConfigMap,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import { GQLBook, GQLBookInp } from '../types/book';
import { addBook, book, books, bookSearch } from '../resolvers/book';

export const BookQueries: GraphQLFieldConfigMap<any, any> = {
    bookSearch: {
        type: GraphQLList(GQLBook),
        description: "A list of books whose title's match query string",
        args: {
            queryString: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => bookSearch(args.queryString)
    },
    book: {
        type: GQLBook,
        description: 'A single book',
        args: {
            bookID: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => book(args.bookID)
    },
    books: {
        type: GraphQLList(GQLBook),
        description: 'A list of books',
        resolve: () => books()
    }
};

export const BookMutations: GraphQLFieldConfigMap<any, any> = {
    addBook: {
        type: GQLBook,
        description: 'This creates a new book',
        args: {
            bookInput: { type: GQLBookInp }
        },
        resolve: (_, args) => addBook(args.bookInput)
    }
};
