import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { GQLBook } from './book';

export const GQLAuthor: any = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an Author',
    fields: () => ({
        authorID: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { type: GraphQLList(GQLBook) }
    })
});
