import {
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from 'graphql';
import { GQLUser, GQLUserInp, GQLUserAuth } from './user';
import { GQLBook, GQLBookInp } from './book';
import { addUser, user, users, login } from '../resolvers/user';
import { addBook, book, books } from '../resolvers/book';

export const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
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
                userInput: { type: GQLUserInp }
            },
            resolve: (_, args) => addUser(args.userInput)
        },
        addBook: {
            type: GQLBook,
            description: 'This creates a new book',
            args: {
                bookInput: { type: GQLBookInp }
            },
            resolve: (_, args) => addBook(args.bookInput)
        }
    })
});
