import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { buildSchema } from "type-graphql";
import { resolvers } from "../src/graphql";

test("GraphQL schema builds with the registered resolvers", async () => {
  const schema = await buildSchema({
    resolvers: [...resolvers] as [typeof resolvers[number], ...typeof resolvers[number][]],
    validate: false,
  });

  assert.ok(schema.getQueryType()?.getFields().inventoryItems);
  assert.ok(schema.getQueryType()?.getFields().allCategoryNames);
  assert.ok(schema.getMutationType()?.getFields().createInventoryItem);
  assert.ok(schema.getMutationType()?.getFields().upsertCategory);
});
