import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

export const GQLTransaction = new GraphQLObjectType({
    name: 'Transaction',
    description: 'This represents a single Transaction record',
    fields: {
        transID: { type: GraphQLNonNull(GraphQLString) },
        userID: { type: GraphQLNonNull(GraphQLString) },
        bookID: { type: GraphQLNonNull(GraphQLString) },
        borrowDate: { type: GraphQLNonNull(GraphQLString) },
        returnDate: { type: GraphQLString }
    }
});
