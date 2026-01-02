import { Resolver, Query, Arg, Mutation, InputType, Field } from "type-graphql";
import { Scale } from "../entity/Scale";
import { InventoryItem } from "../entity/InventoryItem";
import { AppDataSource } from "../data-source";

@InputType()
class ScaleInput {
  @Field()
  scale!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  oldScale?: string;
}

@Resolver(() => Scale)
export class ScaleResolver {
  @Query(() => [String])
  async uniqueScales(): Promise<string[]> {
    const repo = AppDataSource.getRepository(Scale);
    const scales = await repo.find({ select: ["scale"], order: { scale: "ASC" } });
    return scales.map((s) => s.scale);
  }

  @Query(() => Scale, { nullable: true })
  async scaleByValue(@Arg("scale") scale: string): Promise<Scale | undefined> {
    const repo = AppDataSource.getRepository(Scale);
    const result = await repo.findOne({ where: { scale } });
    return result === null ? undefined : result;
  }

  @Mutation(() => Scale)
  async upsertScale(@Arg("input") input: ScaleInput): Promise<Scale> {
    const repo = AppDataSource.getRepository(Scale);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if this is a scale change (editing existing with new scale)
    if (input.oldScale && input.oldScale !== input.scale) {
      // Update all inventory items with the old scale
      await inventoryRepo
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ scale: input.scale })
        .where("scale = :oldScale", { oldScale: input.oldScale })
        .execute();
      
      // Delete the old scale and create a new one with the new scale
      await repo.delete({ scale: input.oldScale });
      const scale = repo.create(input);
      await repo.save(scale);
      return scale;
    }
    
    // Normal upsert logic (no scale change)
    let scale = await repo.findOne({ where: { scale: input.scale } });
    if (scale) {
      scale.description = input.description ?? scale.description;
      await repo.save(scale);
    } else {
      scale = repo.create(input);
      await repo.save(scale);
    }
    return scale;
  }

  @Mutation(() => Boolean)
  async deleteScale(@Arg("scale") scale: string): Promise<boolean> {
    const repo = AppDataSource.getRepository(Scale);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if any inventory items use this scale
    const count = await inventoryRepo.count({ where: { scale } });
    if (count > 0) {
      throw new Error(`Cannot delete scale "${scale}" because ${count} inventory item(s) still use it.`);
    }
    
    const result = await repo.delete({ scale });
    return (result.affected ?? 0) > 0;
  }

  @Query(() => [Scale])
  async scales(): Promise<Scale[]> {
    const repo = AppDataSource.getRepository(Scale);
    return repo.find({ order: { scale: "ASC" } });
  }
}
