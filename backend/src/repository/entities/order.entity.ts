import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  film!: string;

  @Column({ type: 'uuid' })
  session!: string;

  @Column({ type: 'timestamptz' })
  daytime!: Date;

  @Column({ type: 'integer' })
  row!: number;

  @Column({ type: 'integer' })
  seat!: number;

  @Column({ type: 'integer' })
  price!: number;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  phone?: string;
}
