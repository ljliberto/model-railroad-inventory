import { Field, ID, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@ObjectType()
@Entity()
export class InventoryItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "text", nullable: false })
  image!: string; // Base64 encoded image data

  @Field()
  @Column({ type: "text" })
  description!: string;

  @Field()
  @Column({ length: 100 })
  category!: string;

  @Field()
  @Column({ length: 50 })
  scale!: string;

  @Field()
  @Column({ length: 100 })
  manufacturer!: string;

  @Field(() => Number, { nullable: true })
  @Column({ type: "int", nullable: true })
  modelFirstYear?: number | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 100, nullable: true })
  modelNumber?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 200, nullable: true })
  acquiredFrom?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 10, nullable: true })
  acquiredDate?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 100, nullable: true })
  condition?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 200, nullable: true })
  collectionName?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 200, nullable: true })
  storageLocation?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 200, nullable: true })
  variation?: string | null;

  @Field()
  @Column({ type: "boolean", default: false })
  originalBox!: boolean;

  @Field(() => Number, { nullable: true })
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  originalValue?: number | null;

  @Field(() => Number, { nullable: true })
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  estimatedValue?: number | null;

  @Field()
  @CreateDateColumn({ name: "created_timestamp" })
  created_timestamp!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_timestamp" })
  updated_timestamp!: Date;
}
