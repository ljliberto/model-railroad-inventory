import "reflect-metadata";
import { DataSource } from "typeorm";
import { InventoryItem } from "./entity/InventoryItem";
import { Background } from "./entity/Background";
import { Manufacturer } from "./entity/Manufacturer";
import { Scale } from "./entity/Scale";
import { AcquiredSource } from "./entity/Source";
import { StorageLocation } from "./entity/StorageLocation";
import { Category } from "./entity/Category";
import path from "path";

// Use a fixed path in the server directory
const dbPath = path.join(__dirname, "..", "db.sqlite");

console.log("Database path:", dbPath);

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: dbPath,
  entities: [InventoryItem, Background, Manufacturer, Scale, AcquiredSource, StorageLocation, Category],
  synchronize: true,
  logging: false
});
