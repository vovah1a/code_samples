import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { UsersRights } from './UsersRights';

@Entity({ name: 'dp_roles' })
export class Role {

    constructor(data?: Partial<Role>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public nameRu: string;

    @Column('simple-array')
    public action: string[];

    @Column()
    public updateUser: number;

    @UpdateDateColumn()
    public dateUpdate: Date;

    @OneToMany(() => UsersRights, usersRights => usersRights.role)
    public usersRights: UsersRights[];
}
