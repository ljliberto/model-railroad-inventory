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
export class Manufacturer {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ length: 100 })
  name!: string;

  @Field({ nullable: true })
  @Column({ length: 100, nullable: true })
  location?: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: "int", nullable: true })
  yearIncorporated?: number;

  @Field()
  @Column({ type: "boolean", default: false })
  defunct!: boolean;

  @Field()
  @CreateDateColumn()
  created_timestamp!: Date;

  @Field()
  @UpdateDateColumn()
  updated_timestamp!: Date;
}
