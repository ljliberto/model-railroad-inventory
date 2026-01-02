import { Resolver, Query, Arg, Mutation, InputType, Field } from "type-graphql";
import { StorageLocation } from "../entity/StorageLocation";
import { InventoryItem } from "../entity/InventoryItem";
import { AppDataSource } from "../data-source";

@InputType()
class StorageLocationInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  oldName?: string;
}

@Resolver(() => StorageLocation)
export class StorageLocationResolver {
  @Query(() => [String])
  async allStorageLocationNames(): Promise<string[]> {
    const repo = AppDataSource.getRepository(StorageLocation);
    const locations = await repo.find({ select: ["name"], order: { name: "ASC" } });
    return locations.map((l) => l.name);
  }

  @Query(() => [StorageLocation])
  async storageLocations(): Promise<StorageLocation[]> {
    const repo = AppDataSource.getRepository(StorageLocation);
    return await repo.find({ order: { name: "ASC" } });
  }

  @Query(() => StorageLocation, { nullable: true })
  async storageLocationByName(@Arg("name") name: string): Promise<StorageLocation | undefined> {
    const repo = AppDataSource.getRepository(StorageLocation);
    const result = await repo.findOne({ where: { name } });
    return result === null ? undefined : result;
  }

  @Mutation(() => StorageLocation)
  async upsertStorageLocation(@Arg("input") input: StorageLocationInput): Promise<StorageLocation> {
    const repo = AppDataSource.getRepository(StorageLocation);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if this is a name change (editing existing with new name)
    if (input.oldName && input.oldName !== input.name) {
      // Update all inventory items with the old storage location name
      await inventoryRepo
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ storageLocation: input.name })
        .where("storageLocation = :oldName", { oldName: input.oldName })
        .execute();
      
      // Delete the old storage location and create a new one with the new name
      await repo.delete({ name: input.oldName });
      const location = repo.create(input);
      await repo.save(location);
      return location;
    }
    
    // Normal upsert logic (no name change)
    let location = await repo.findOne({ where: { name: input.name } });
    if (location) {
      location.description = input.description ?? location.description;
      await repo.save(location);
    } else {
      location = repo.create(input);
      await repo.save(location);
    }
    return location;
  }

  @Mutation(() => Boolean)
  async deleteStorageLocation(@Arg("name") name: string): Promise<boolean> {
    const repo = AppDataSource.getRepository(StorageLocation);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if any inventory items use this storage location
    const count = await inventoryRepo.count({ where: { storageLocation: name } });
    if (count > 0) {
      throw new Error(`Cannot delete storage location "${name}" because ${count} inventory item(s) still use it.`);
    }
    
    const result = await repo.delete({ name });
    return (result.affected ?? 0) > 0;
  }
}
