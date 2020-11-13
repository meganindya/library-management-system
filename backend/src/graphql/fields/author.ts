import { GraphQLFieldConfigMap, GraphQLList, GraphQLNonNull, GraphQLString } from 'graphql';
import { GQLAuthor } from '../types/author';
import { GQLBook } from '../types/book';
import { addAuthor, authorBooks, authors, tempAuthorAction } from '../resolvers/author';

export const AuthorQueries: GraphQLFieldConfigMap<any, any> = {
    // development
    authorBooks: {
        type: GraphQLList(GQLBook),
        description: 'A list of books for author names',
        args: {
            nameQuery: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => authorBooks(args.nameQuery)
    },
    // development
    authors: {
        type: GraphQLList(GQLAuthor),
        description: 'A list of authors',
        resolve: authors
    }
};

export const AuthorMutations: GraphQLFieldConfigMap<any, any> = {
    // development
    addAuthor: {
        type: GQLAuthor,
        description: 'Creates a new author entry',
        args: {
            name: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, args) => addAuthor(args.name)
    },
    // temporary
    tempAuthorAction: {
        type: GQLAuthor,
        description: 'Does some temporary action on author',
        resolve: tempAuthorAction
    }
};
