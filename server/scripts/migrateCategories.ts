import "reflect-metadata";
import { AppDataSource } from "../src/data-source";
import { InventoryItem } from "../src/entity/InventoryItem";
import { Category } from "../src/entity/Category";

async function migrateCategories() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connection initialized");

    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    const categoryRepo = AppDataSource.getRepository(Category);

    // Get distinct category values from InventoryItem
    const result = await inventoryRepo
      .createQueryBuilder("inventoryItem")
      .select("DISTINCT inventoryItem.category", "category")
      .orderBy("inventoryItem.category", "ASC")
      .getRawMany();

    const distinctCategories = result.map((row: { category: string }) => row.category);

    console.log(`Found ${distinctCategories.length} distinct categories:`, distinctCategories);

    // Insert each category into the Category table
    let inserted = 0;
    let skipped = 0;

    for (const categoryName of distinctCategories) {
      if (!categoryName) {
        console.log("Skipping empty category name");
        skipped++;
        continue;
      }

      // Check if category already exists
      const existing = await categoryRepo.findOne({ where: { name: categoryName } });
      
      if (existing) {
        console.log(`Category "${categoryName}" already exists, skipping`);
        skipped++;
      } else {
        // Create new category
        const category = categoryRepo.create({
          name: categoryName
        });
        await categoryRepo.save(category);
        console.log(`Inserted category: "${categoryName}"`);
        inserted++;
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`- Inserted: ${inserted}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Total: ${distinctCategories.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

migrateCategories();
