import { AppDataSource } from "../src/data-source";
import { InventoryItem } from "../src/entity/InventoryItem";
import { Scale } from "../src/entity/Scale";

async function main() {
  await AppDataSource.initialize();
  const itemRepo = AppDataSource.getRepository(InventoryItem);
  const scaleRepo = AppDataSource.getRepository(Scale);

  // Get all distinct scale values from InventoryItem
  const distinctScales = await itemRepo
    .createQueryBuilder("item")
    .select("DISTINCT item.scale", "scale")
    .where("item.scale IS NOT NULL AND item.scale != ''")
    .getRawMany();

  for (const row of distinctScales) {
    const scaleValue = row.scale.trim();
    if (!scaleValue) continue;
    let existing = await scaleRepo.findOne({ where: { scale: scaleValue } });
    if (!existing) {
      const newScale = scaleRepo.create({ scale: scaleValue });
      await scaleRepo.save(newScale);
      console.log(`Added scale: ${scaleValue}`);
    } else {
      console.log(`Scale already exists: ${scaleValue}`);
    }
  }

  await AppDataSource.destroy();
  console.log("Scale table update complete.");
}

main().catch(err => {
  console.error("Error updating scales:", err);
  process.exit(1);
});
