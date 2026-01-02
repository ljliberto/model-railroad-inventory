import { Mutation, Query, Resolver, Arg } from "type-graphql";
import { Background } from "../entity/Background";
import { AppDataSource } from "../data-source";

@Resolver(Background)
export class BackgroundResolver {
  private repo = AppDataSource.getRepository(Background);

  @Query(() => Background, { nullable: true })
  async background(): Promise<Background | null> {
    // Return the most recent background
    const backgrounds = await this.repo.find({ 
      order: { created_timestamp: "DESC" },
      take: 1 
    });
    return backgrounds[0] || null;
  }

  @Mutation(() => Background)
  async setBackground(@Arg("image") image: string): Promise<Background> {
    // Delete all existing backgrounds (find them first to avoid empty criteria error)
    const existing = await this.repo.find();
    if (existing.length > 0) {
      await this.repo.remove(existing);
    }
    
    // Create and save new background
    const background = this.repo.create({ image });
    return this.repo.save(background);
  }
}
