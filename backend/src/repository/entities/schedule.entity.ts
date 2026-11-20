import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { FilmEntity } from './film.entity';

@Entity({ name: 'schedules' })
export class ScheduleEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz' })
  daytime!: Date;

  @Column({ type: 'integer' })
  hall!: number;

  @Column({ type: 'integer' })
  rows!: number;

  @Column({ type: 'integer' })
  seats!: number;

  @Column({ type: 'integer' })
  price!: number;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  taken!: string[];

  @ManyToOne(() => FilmEntity, (film) => film.schedule, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'film_id', referencedColumnName: 'id' })
  film!: FilmEntity;
}
