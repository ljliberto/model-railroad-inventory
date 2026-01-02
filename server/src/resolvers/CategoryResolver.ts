import { Resolver, Query, Arg, Mutation, InputType, Field } from "type-graphql";
import { Category } from "../entity/Category";
import { InventoryItem } from "../entity/InventoryItem";
import { AppDataSource } from "../data-source";

@InputType()
class CategoryInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  oldName?: string;
}

@Resolver(() => Category)
export class CategoryResolver {
  @Query(() => [String])
  async allCategoryNames(): Promise<string[]> {
    const repo = AppDataSource.getRepository(Category);
    const categories = await repo.find({ select: ["name"], order: { name: "ASC" } });
    return categories.map((c) => c.name);
  }

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    const repo = AppDataSource.getRepository(Category);
    return await repo.find({ order: { name: "ASC" } });
  }

  @Query(() => Category, { nullable: true })
  async categoryByName(@Arg("name") name: string): Promise<Category | undefined> {
    const repo = AppDataSource.getRepository(Category);
    const result = await repo.findOne({ where: { name } });
    return result === null ? undefined : result;
  }

  @Mutation(() => Category)
  async upsertCategory(@Arg("input") input: CategoryInput): Promise<Category> {
    const repo = AppDataSource.getRepository(Category);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if this is a name change (editing existing with new name)
    if (input.oldName && input.oldName !== input.name) {
      // Update all inventory items with the old category name
      await inventoryRepo
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ category: input.name })
        .where("category = :oldName", { oldName: input.oldName })
        .execute();
      
      // Delete the old category and create a new one with the new name
      await repo.delete({ name: input.oldName });
      const category = repo.create(input);
      await repo.save(category);
      return category;
    }
    
    // Normal upsert logic (no name change)
    let category = await repo.findOne({ where: { name: input.name } });
    if (category) {
      category.description = input.description ?? category.description;
      await repo.save(category);
    } else {
      category = repo.create(input);
      await repo.save(category);
    }
    return category;
  }

  @Mutation(() => Boolean)
  async deleteCategory(@Arg("name") name: string): Promise<boolean> {
    const repo = AppDataSource.getRepository(Category);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if any inventory items use this category
    const count = await inventoryRepo.count({ where: { category: name } });
    if (count > 0) {
      throw new Error(`Cannot delete category "${name}" because ${count} inventory item(s) still use it.`);
    }
    
    const result = await repo.delete({ name });
    return (result.affected ?? 0) > 0;
  }
}
