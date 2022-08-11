import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Role } from './Role';
import { User } from './User';

@Entity({ name: 'users_rights' })
export class UsersRights {

    constructor(data?: Partial<UsersRights>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, user => user.usersRights)
    public user: User;

    @ManyToOne(() => Role, role => role.usersRights)
    public role: Role;

    @Column()
    public dateBegin: Date;

    @Column()
    public dateEnd: Date;

    @CreateDateColumn()
    public dateCreate: Date;

    @Column()
    public updateUser: number;

    @Column({ type: 'boolean' })
    public isActive: boolean;
}
