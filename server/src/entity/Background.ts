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
export class Background {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "text", nullable: false })
  image!: string; // Base64 encoded image data

  @Field()
  @CreateDateColumn({ name: "created_timestamp" })
  created_timestamp!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_timestamp" })
  updated_timestamp!: Date;
}
