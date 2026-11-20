import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ScheduleEntity } from './schedule.entity';

@Entity({ name: 'films' })
export class FilmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'double precision', nullable: true })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  director!: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @Column({ type: 'text', nullable: true })
  title!: string;

  @Column({ type: 'text', nullable: true })
  about!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  image!: string;

  @Column({ type: 'text', nullable: true })
  cover!: string;

  @OneToMany(() => ScheduleEntity, (schedule) => schedule.film)
  schedule!: ScheduleEntity[];
}
