import { Entity, PrimaryColumn, Column } from "typeorm";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity()
export class AcquiredSource {
  @Field()
  @PrimaryColumn()
  name!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;
}
