import { Arg, Mutation, Query, Resolver, ID } from "type-graphql";
import { InventoryItem } from "../entity/InventoryItem";
import { AppDataSource } from "../data-source";
import { InventoryInput } from "./InventoryInput";

@Resolver(InventoryItem)
export class InventoryResolver {
  private repo = AppDataSource.getRepository(InventoryItem);

  @Query(() => [InventoryItem])
  async inventoryItems(): Promise<InventoryItem[]> {
    return this.repo.find({ order: { manufacturer: "ASC", modelNumber: "ASC" } });
  }

  @Query(() => [InventoryItem])
  async inventoryItemsByCategory(
    @Arg("category", () => String) category: string
  ): Promise<InventoryItem[]> {
    return this.repo.find({ where: { category }, order: { manufacturer: "ASC", modelNumber: "ASC" } });
  }

  @Query(() => [InventoryItem])
  async inventoryItemsByStorageLocation(
    @Arg("storageLocation", () => String) storageLocation: string
  ): Promise<InventoryItem[]> {
    return this.repo.find({ where: { storageLocation }, order: { manufacturer: "ASC", modelNumber: "ASC" } });
  }

  @Query(() => InventoryItem, { nullable: true })
  async inventoryItem(@Arg("id", () => ID) id: number): Promise<InventoryItem | null> {
    return this.repo.findOne({ where: { id } });
  }

  @Mutation(() => InventoryItem)
  async createInventoryItem(
    @Arg("input") input: InventoryInput
  ): Promise<InventoryItem> {
    const item = this.repo.create(input);
    return this.repo.save(item);
  }


  @Mutation(() => InventoryItem)
  async updateInventoryItem(
    @Arg("id", () => ID) id: number,
    @Arg("input") input: InventoryInput
  ): Promise<InventoryItem> {
    const item = await this.repo.findOneOrFail({ where: { id } });
    Object.assign(item, input);
    return this.repo.save(item);
  }

  @Mutation(() => [InventoryItem])
  async updateInventoryItemsByCategory(
    @Arg("category", () => String) category: string,
    @Arg("input") input: InventoryInput
  ): Promise<InventoryItem[]> {
    const items = await this.repo.find({ where: { category } });
    const updated = await Promise.all(
      items.map(async item => {
        Object.assign(item, input);
        return this.repo.save(item);
      })
    );
    return updated;
  }

  @Mutation(() => InventoryItem)
  async updateInventoryItemById(
    @Arg("id", () => ID) id: number,
    @Arg("input") input: InventoryInput
  ): Promise<InventoryItem> {
    const item = await this.repo.findOneOrFail({ where: { id } });
    Object.assign(item, input);
    return this.repo.save(item);
  }

  @Mutation(() => Boolean)
  async deleteInventoryItemsByCategory(
    @Arg("category", () => String) category: string
  ): Promise<boolean> {
    await this.repo.delete({ category });
    return true;
  }

  @Mutation(() => Boolean)
  async deleteInventoryItem(
    @Arg("id", () => ID) id: number
  ): Promise<boolean> {
    await this.repo.delete(id);
    return true;
  }

  @Query(() => [String])
  async distinctCategories(): Promise<string[]> {
    const result = await this.repo
      .createQueryBuilder("inventoryItem")
      .select("DISTINCT inventoryItem.category", "category")
      .orderBy("inventoryItem.category", "ASC")
      .getRawMany();
    return result.map((row: { category: string }) => row.category);
  }
}
