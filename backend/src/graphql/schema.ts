import { GraphQLSchema } from 'graphql';
import { RootMutationType, RootQueryType } from './types/root';

const schema: GraphQLSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

export default schema;
