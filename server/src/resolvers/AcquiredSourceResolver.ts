import { Resolver, Query, Arg, Mutation, InputType, Field } from "type-graphql";
import { AcquiredSource } from "../entity/Source";
import { InventoryItem } from "../entity/InventoryItem";
import { AppDataSource } from "../data-source";

@InputType()
class SourceInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  oldName?: string;
}

@Resolver(() => AcquiredSource)
export class AcquiredSourceResolver {
  @Query(() => [String])
  async allSourceNames(): Promise<string[]> {
    const repo = AppDataSource.getRepository(AcquiredSource);
    const sources = await repo.find({ select: ["name"], order: { name: "ASC" } });
    return sources.map((s) => s.name);
  }

  @Query(() => [AcquiredSource])
  async sources(): Promise<AcquiredSource[]> {
    const repo = AppDataSource.getRepository(AcquiredSource);
    return await repo.find({ order: { name: "ASC" } });
  }

  @Query(() => AcquiredSource, { nullable: true })
  async sourceByName(@Arg("name") name: string): Promise<AcquiredSource | undefined> {
    const repo = AppDataSource.getRepository(AcquiredSource);
    const result = await repo.findOne({ where: { name } });
    return result === null ? undefined : result;
  }

  @Mutation(() => AcquiredSource)
  async upsertSource(@Arg("input") input: SourceInput): Promise<AcquiredSource> {
    const repo = AppDataSource.getRepository(AcquiredSource);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if this is a name change (editing existing with new name)
    if (input.oldName && input.oldName !== input.name) {
      // Update all inventory items with the old source name
      await inventoryRepo
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ acquiredFrom: input.name })
        .where("acquiredFrom = :oldName", { oldName: input.oldName })
        .execute();
      
      // Delete the old source and create a new one with the new name
      await repo.delete({ name: input.oldName });
      const source = repo.create(input);
      await repo.save(source);
      return source;
    }
    
    // Normal upsert logic (no name change)
    let source = await repo.findOne({ where: { name: input.name } });
    if (source) {
      source.description = input.description ?? source.description;
      await repo.save(source);
    } else {
      source = repo.create(input);
      await repo.save(source);
    }
    return source;
  }

  @Mutation(() => Boolean)
  async deleteSource(@Arg("name") name: string): Promise<boolean> {
    const repo = AppDataSource.getRepository(AcquiredSource);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if any inventory items use this source
    const count = await inventoryRepo.count({ where: { acquiredFrom: name } });
    if (count > 0) {
      throw new Error(`Cannot delete source "${name}" because ${count} inventory item(s) still use it.`);
    }
    
    const result = await repo.delete({ name });
    return (result.affected ?? 0) > 0;
  }
}
