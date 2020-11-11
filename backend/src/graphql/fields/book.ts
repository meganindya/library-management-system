import { GraphQLFieldConfigMap, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { GQLBook, GQLBookInp, GQLCategory } from '../types/book';
import { addBook, book, books, bookSearch, categories, tempBookAction } from '../resolvers/book';

export const BookQueries: GraphQLFieldConfigMap<any, any> = {
    categories: {
        type: GraphQLList(GQLCategory),
        description: 'A list of categories',
        resolve: () => categories()
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
            queryString: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => bookSearch(args.queryString)
    },
    // for debugging
    books: {
        type: GraphQLList(GQLBook),
        description: 'A list of books',
        resolve: () => books()
    }
};

export const BookMutations: GraphQLFieldConfigMap<any, any> = {
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
        type: GQLBook,
        description: 'Does some temporary action on book',
        resolve: () => tempBookAction()
    }
};
