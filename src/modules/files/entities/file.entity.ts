import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  original_name: string;

  @Column()
  file_path: string;

  @Column()
  mime_type: string;

  @Column('bigint')
  size: number;

  @CreateDateColumn()
  uploaded_at: Date;

  @Column({ nullable: true })
  uploaded_by: string;
}
