import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { GQLBook } from './book';
import { GQLUser } from './user';

export const GQLAwaiting = new GraphQLObjectType({
    name: 'Awaiting',
    description: 'Represents an Awaiting transaction',
    fields: () => ({
        user: { type: GraphQLNonNull(GQLUser) },
        book: { type: GraphQLNonNull(GQLBook) },
        type: { type: GraphQLNonNull(GraphQLString) },
        createdAt: { type: GraphQLNonNull(GraphQLString) }
    })
});
