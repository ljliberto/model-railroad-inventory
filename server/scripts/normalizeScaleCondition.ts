import { AppDataSource } from "../src/data-source";
import { InventoryItem } from "../src/entity/InventoryItem";

const allowedScales = ["O","S","HO","G","N","Z","Standard","Other"];
const allowedConditions = ["Mint","Exellent","Good","Fair","Poor"];

async function normalizeScaleCondition() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(InventoryItem);
  const items = await repo.find();
  for (const item of items) {
    if (!allowedScales.includes(item.scale ?? "")) {
      item.scale = "Other";
      console.log(`Updated item ${item.id} scale to Other`);
    }
    if (!allowedConditions.includes(item.condition ?? "")) {
      item.condition = "Fair";
      console.log(`Updated item ${item.id} condition to Fair`);
    }
    await repo.save(item);
  }
  await AppDataSource.destroy();
  console.log("Done normalizing scale and condition.");
}

normalizeScaleCondition();
