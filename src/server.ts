import Fastify from "fastify";
import { buildSchema, graphql } from "graphql";
import { root } from "resolvers";

const fastify = Fastify();

const schema = buildSchema(`
  type Class {
    name: String!
    icon: String
    spells: [Spell!]!
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
    # Get all classes with their spells resolved
    classes: [Class!]!

    # Get a specific class by name
    class(name: String!): Class

    # Get spells for a specific class (same as before for compatibility)
    classSpells(className: String!): [Spell!]!

    # Get a specific spell by ID
    spell(id: String!): Spell

    # Search spells by level
    spellsByLevel(level: Int!): [Spell!]!

    # Get all spells (with optional filtering)
    spells(level: Int, className: String, limit: Int): [Spell!]!
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
