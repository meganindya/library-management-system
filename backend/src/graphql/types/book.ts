import {
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from 'graphql';
import { GQLAuthor } from './author';

export const GQLBook = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a Book',
    fields: () => ({
        bookID: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        category: { type: GraphQLNonNull(GraphQLString) },
        abstract: { type: GraphQLString },
        quantity: { type: GraphQLNonNull(GraphQLInt) },
        authors: { type: GraphQLList(GQLAuthor) },
        subscribers: { type: GraphQLList(GraphQLString) }
    })
});

export const GQLBookInp = new GraphQLInputObjectType({
    name: 'BookInput',
    description: 'This represents a User input',
    fields: {
        bookID: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        category: { type: GraphQLNonNull(GraphQLString) },
        abstract: { type: GraphQLString },
        quantity: { type: GraphQLNonNull(GraphQLInt) },
        authors: { type: GraphQLList(GraphQLString) }
    }
});

export const GQLCategory = new GraphQLObjectType({
    name: 'Category',
    description: 'This represents a catetgory',
    fields: {
        name: { type: GraphQLNonNull(GraphQLString) },
        quantity: { type: GraphQLNonNull(GraphQLInt) }
    }
});
