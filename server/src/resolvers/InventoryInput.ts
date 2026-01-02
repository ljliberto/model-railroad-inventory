import { InputType, Field, Int } from "type-graphql";

@InputType()
export class InventoryInput {
  @Field()
  image!: string; // Base64 encoded image data

  @Field()
  description!: string;

  @Field()
  category!: string;

  @Field()
  scale!: string;

  @Field()
  manufacturer!: string;

  @Field(() => Int, { nullable: true })
  modelFirstYear?: number | null;

  @Field(() => String, { nullable: true })
  modelNumber?: string | null;

  @Field(() => String, { nullable: true })
  acquiredFrom?: string | null;

  @Field(() => String, { nullable: true })
  acquiredDate?: string | null; // ISO date string from client

  @Field(() => String, { nullable: true })
  condition?: string | null;

  @Field(() => String, { nullable: true })
  collectionName?: string | null;

  @Field(() => String, { nullable: true })
  storageLocation?: string | null;

  @Field(() => String, { nullable: true })
  variation?: string | null;

  @Field()
  originalBox!: boolean;

  @Field(() => Number, { nullable: true })
  originalValue?: number | null;

  @Field(() => Number, { nullable: true })
  estimatedValue?: number | null;
}
