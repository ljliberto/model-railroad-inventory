import { DataSource } from "typeorm";
import path from "path";

async function migrateStorageLocations() {
  // Create a minimal data source without GraphQL
  const dbPath = path.join(__dirname, "..", "db.sqlite");
  
  const AppDataSource = new DataSource({
    type: "sqlite",
    database: dbPath,
    synchronize: false,
    logging: true
  });

  try {
    await AppDataSource.initialize();
    console.log("Database connection initialized");
    console.log("Database path:", dbPath);

    // Get all distinct storage locations from inventory items using raw query
    const items = await AppDataSource.query(
      `SELECT DISTINCT storageLocation FROM inventory_item WHERE storageLocation IS NOT NULL AND storageLocation != '' ORDER BY storageLocation`
    );

    console.log(`Found ${items.length} distinct storage locations`);

    let inserted = 0;
    let skipped = 0;

    for (const item of items) {
      const locationName = item.storageLocation;
      if (!locationName) continue;

      // Check if already exists
      const existing = await AppDataSource.query(
        `SELECT name FROM storage_location WHERE name = ?`,
        [locationName]
      );
      
      if (existing && existing.length > 0) {
        console.log(`Skipping existing: ${locationName}`);
        skipped++;
        continue;
      }

      // Insert new storage location
      await AppDataSource.query(
        `INSERT INTO storage_location (name, description) VALUES (?, ?)`,
        [locationName, null]
      );
      console.log(`Inserted: ${locationName}`);
      inserted++;
    }

    console.log(`\nMigration complete!`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Error during migration:", error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

migrateStorageLocations();
