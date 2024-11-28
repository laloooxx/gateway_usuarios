import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    ADMIN = 'admin',
    CLIENT= 'client'    
}

@Entity('users')
export class UsuarioEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        type: 'varchar', 
        unique: true,
        length: 255,
        nullable: false
    })
    nombre: string;

    @Column({
        type: 'varchar', 
        length: 255,
        nullable: false,
        unique: true
    })
    email: string;

    @Column({
        type: 'varchar', 
        length: 255,
        nullable: false
    })
    password: string;

    @Column({
        type: 'bool',
        default: true,
    })
    isActive?: boolean;

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255
    })
    avatar?: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: 'client'
    })
    role: Role;
}