import { Entity, Column, Index } from 'typeorm';
import BaseModel from '@/shared/models/BaseModel';
import { BuildStrategy, SourceType } from '@quantum/contracts/modules/repository/domain';
import { RepositoryFields } from '../contracts/domain/repository';

@Entity()
@Index(['alias', 'organizationId'], { unique: true })
export default class Repository extends BaseModel implements RepositoryFields{
    @Column('varchar')
    name!: string;

    @Column('varchar')
    alias!: string;

    @Column({ type: 'varchar', nullable: true })
    owner!: string | null;

    @Column({ type: 'varchar', default: 'main' })
    branch!: string;

    @Column({ type: 'varchar', nullable: true })
    webhookId!: string | null;

    @Column({ type: 'varchar', default: '' })
    buildCommand!: string;

    @Column({ type: 'varchar', default: '' })
    installCommand!: string;

    @Column({ type: 'varchar', default: '' })
    startCommand!: string;

    @Column({ type: 'varchar', default: '/' })
    rootDirectory!: string;

    @Column({ type: 'varchar', nullable: true })
    framework!: string | null;

    @Column({ type: 'varchar', nullable: true })
    runtime!: string | null;

    @Column({ type: 'varchar', nullable: true })
    runtimeVersion!: string | null;

    @Column({ type: 'varchar', nullable: true })
    outputDirectory!: string | null;

    @Column({ type: 'simple-enum', enum: BuildStrategy, default: BuildStrategy.Exec })
    buildStrategy!: BuildStrategy;

    @Column({ type: 'varchar', nullable: true })
    dockerfilePath!: string | null;

    @Column({ type: 'varchar', nullable: true })
    image!: string | null;

    @Column('varchar')
    url!: string;

    @Column({ type: 'int', nullable: true })
    port!: number | null;

    @Column({ type: 'varchar', nullable: true })
    healthCheckPath!: string | null;

    @Column('int')
    userId!: number;

    @Column({ type: 'int', nullable: true })
    organizationId!: number | null;

    @Column('int')
    projectId!: number;

    @Column({ type: 'simple-enum', enum: SourceType, default: SourceType.Github })
    sourceType!: SourceType;

    @Column({ type: 'jsonb', default: [] })
    volumes!: string[];
}
