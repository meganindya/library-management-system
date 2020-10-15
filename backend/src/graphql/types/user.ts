import {
    GraphQLInputObjectType,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from 'graphql';

export const GQLUser = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a User',
    fields: {
        userID: { type: GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLNonNull(GraphQLString) },
        middleName: { type: GraphQLString },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLString },
        type: { type: GraphQLNonNull(GraphQLString) }
    }
});

export const GQLUserInp = new GraphQLInputObjectType({
    name: 'UserInput',
    description: 'This represents a User input',
    fields: {
        userID: { type: GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLNonNull(GraphQLString) },
        middleName: { type: GraphQLString },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        type: { type: GraphQLNonNull(GraphQLString) }
    }
});
