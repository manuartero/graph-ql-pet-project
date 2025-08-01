import Fastify from "fastify";
import { buildSchema, graphql } from "graphql";
import { root } from "resolvers";

const fastify = Fastify();

const schema = buildSchema(`
  type Class {
    name: String!
    icon: String
    spells: [String!]!
  }

  type Damage {
    dice: String!
    damageType: String!
  }

  type Spell {
    id: String!
    name: String!
    url: String
    icon: String
    level: Int!
    upcast: Boolean
    action: String
    duration: String
    range: String
    type: String
    damage: [Damage!]
  }

  type Query {
    classes: [Class!]!
    classSpells(className: String!): [Spell!]!
  }
`);

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
