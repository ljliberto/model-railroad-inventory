import { Field, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@ObjectType()
@Entity()
export class Scale {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ length: 50, unique: true })
  scale!: string;

  @Field({ nullable: true })
  @Column({ length: 200, nullable: true })
  description?: string;

  @Field()
  @CreateDateColumn()
  created_timestamp!: Date;

  @Field()
  @UpdateDateColumn()
  updated_timestamp!: Date;
}
