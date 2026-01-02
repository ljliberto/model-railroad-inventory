import { Resolver, Query, Arg, Mutation, InputType, Field } from "type-graphql";
import { Manufacturer } from "../entity/Manufacturer";
import { InventoryItem } from "../entity/InventoryItem";
import { AppDataSource } from "../data-source";

@InputType()
class ManufacturerInput {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  yearIncorporated?: number;

  @Field({ nullable: true })
  defunct?: boolean;

  @Field({ nullable: true })
  oldName?: string;
}

@Resolver(() => Manufacturer)
export class ManufacturerResolver {
  @Query(() => Manufacturer, { nullable: true })
  async manufacturerByName(@Arg("name") name: string): Promise<Manufacturer | undefined> {
    const result = await AppDataSource.getRepository(Manufacturer).findOne({ where: { name } });
    return result === null ? undefined : result;
  }

  @Query(() => [String])
  async allManufacturerNames(): Promise<string[]> {
    const repo = AppDataSource.getRepository(Manufacturer);
    const manufacturers = await repo.find({ select: ["name"], order: { name: "ASC" } });
    return manufacturers.map((m: Manufacturer) => m.name);
  }

  @Query(() => [Manufacturer])
  async allManufacturers(): Promise<Manufacturer[]> {
    const repo = AppDataSource.getRepository(Manufacturer);
    return await repo.find({ order: { name: "ASC" } });
  }

  @Mutation(() => Manufacturer)
  async upsertManufacturer(
    @Arg("input") input: ManufacturerInput
  ): Promise<Manufacturer> {
    const repo = AppDataSource.getRepository(Manufacturer);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if this is a name change (editing existing with new name)
    if (input.oldName && input.oldName !== input.name) {
      // Update all inventory items with the old manufacturer name
      await inventoryRepo
        .createQueryBuilder()
        .update(InventoryItem)
        .set({ manufacturer: input.name })
        .where("manufacturer = :oldName", { oldName: input.oldName })
        .execute();
      
      // Delete the old manufacturer and create a new one with the new name
      await repo.delete({ name: input.oldName });
      const manufacturer = repo.create(input);
      await repo.save(manufacturer);
      return manufacturer;
    }
    
    // Normal upsert logic (no name change)
    let manufacturer = await repo.findOne({ where: { name: input.name } });
    if (manufacturer) {
      manufacturer.description = input.description ?? manufacturer.description;
      manufacturer.yearIncorporated = input.yearIncorporated ?? manufacturer.yearIncorporated;
      manufacturer.defunct = input.defunct ?? manufacturer.defunct;
      await repo.save(manufacturer);
    } else {
      manufacturer = repo.create(input);
      await repo.save(manufacturer);
    }
    return manufacturer;
  }

  @Mutation(() => Boolean)
  async deleteManufacturer(
    @Arg("name") name: string
  ): Promise<boolean> {
    const repo = AppDataSource.getRepository(Manufacturer);
    const inventoryRepo = AppDataSource.getRepository(InventoryItem);
    
    // Check if any inventory items use this manufacturer
    const count = await inventoryRepo.count({ where: { manufacturer: name } });
    if (count > 0) {
      throw new Error(`Cannot delete manufacturer "${name}" because ${count} inventory item(s) still use it.`);
    }
    
    const result = await repo.delete({ name });
    return (result.affected ?? 0) > 0;
  }
}
