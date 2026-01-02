import "reflect-metadata";
import express from "express";
import cors from "cors";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { AppDataSource } from "./data-source";
import { resolvers } from "./graphql";


async function bootstrap() {
  await AppDataSource.initialize();

  const schema = await buildSchema({
    resolvers,
    validate: false
  });

  const server = new ApolloServer({
    schema
  });

  await server.start();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚂 Inventory server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

bootstrap().catch((err) => {
  console.error("Error starting server", err);
});
