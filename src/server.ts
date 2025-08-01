import Fastify from "fastify";
import { graphql, buildSchema } from "graphql";

const fastify = Fastify();

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => "world",
};

fastify.post("/graphql", async (req, reply) => {
  const { query, variables, operationName } = req.body as {
    query: string;
    variables?: Record<string, any>;
    operationName?: string;
  };

  const result = await graphql({
    schema,
    source: query,
    variableValues: variables,
    rootValue: root,
    operationName,
  });

  return result;
});

export async function startServer() {
  fastify.listen({ port: 4000 }, () => {
    console.log("🚀 Server running at http://localhost:4000/graphql");
  });
}
