import { AppDataSource } from "../src/data-source";
import { InventoryItem } from "../src/entity/InventoryItem";

const allowedCategories = [
  "Accessories","Literature","Locomotive","Motive Power","Observation Car","Other","Passenger Car","Rolling Stock","Scenery","Slot Set","Tracks","Train Set","Unknown"
];

async function normalizeCategories() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(InventoryItem);
  const items = await repo.find();
  for (const item of items) {
    if (!allowedCategories.includes(item.category)) {
      item.category = "Unknown";
      await repo.save(item);
      console.log(`Updated item ${item.id} category to Unknown`);
    }
  }
  await AppDataSource.destroy();
  console.log("Done normalizing categories.");
}

normalizeCategories();
