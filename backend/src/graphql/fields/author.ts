import {
    GraphQLFieldConfigMap,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import { GQLAuthor } from '../types/author';
import { GQLBook } from '../types/book';
import { addAuthor, authorBooks, authors } from '../resolvers/author';

export const AuthorQueries: GraphQLFieldConfigMap<any, any> = {
    authorBooks: {
        type: GQLBook,
        description: 'A list of books for author names',
        args: {
            nameQuery: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => authorBooks(args.nameQuery)
    },
    authors: {
        type: GraphQLList(GQLAuthor),
        description: 'A list of authors',
        resolve: () => authors()
    }
};

export const AuthorMutations: GraphQLFieldConfigMap<any, any> = {
    addAuthor: {
        type: GQLAuthor,
        description: 'A single author',
        args: {
            name: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => addAuthor(args.name)
    }
};
