import { AppDataSource } from "../src/data-source";
import { InventoryItem } from "../src/entity/InventoryItem";
import { Manufacturer } from "../src/entity/Manufacturer";

async function main() {
  await AppDataSource.initialize();
  const itemRepo = AppDataSource.getRepository(InventoryItem);
  const manufacturerRepo = AppDataSource.getRepository(Manufacturer);

  // Get all distinct manufacturer names from InventoryItem
  const distinctManufacturers = await itemRepo
    .createQueryBuilder("item")
    .select("DISTINCT item.manufacturer", "manufacturer")
    .where("item.manufacturer IS NOT NULL AND item.manufacturer != ''")
    .getRawMany();

  for (const row of distinctManufacturers) {
    const name = row.manufacturer.trim();
    if (!name) continue;
    let existing = await manufacturerRepo.findOne({ where: { name } });
    if (!existing) {
      const newManu = manufacturerRepo.create({ name });
      await manufacturerRepo.save(newManu);
      console.log(`Added manufacturer: ${name}`);
    } else {
      console.log(`Manufacturer already exists: ${name}`);
    }
  }

  await AppDataSource.destroy();
  console.log("Manufacturer table update complete.");
}

main().catch(err => {
  console.error("Error updating manufacturers:", err);
  process.exit(1);
});
