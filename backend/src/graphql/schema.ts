import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { UserMutations, UserQueries } from './fields/user';
import { BookMutations, BookQueries } from './fields/book';
import { AuthorMutations, AuthorQueries } from './fields/author';
import { TransactionMutations, TransactionQueries } from './fields/transaction';

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: 'Root Query',
        fields: () => ({
            ...UserQueries,
            ...AuthorQueries,
            ...BookQueries,
            ...TransactionQueries
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        description: 'Root Mutation',
        fields: () => ({
            ...UserMutations,
            ...AuthorMutations,
            ...BookMutations,
            ...TransactionMutations
        })
    })
});

export default schema;
