import { GraphQLClient } from 'graphql-request';

export const hygraphClient = new GraphQLClient(process.env.NEXT_HYGRAPH_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
  },
});