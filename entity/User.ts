import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { UsersRights } from './UsersRights';

@Entity({ name: 'users' })
export class User {

    constructor(data?: Partial<User>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: true})
    public userLogin: string;

    @Column()
    public userPassword: string;

    @Column({nullable: true})
    public userLastName: string;

    @Column({nullable: true})
    public userFirstName: string;

    @Column({nullable: true})
    public userMiddleName: string;

    @Column({
        nullable: true,
        type: 'date',
    })
    public userBirthDate: Date;

    @Column({nullable: true})
    public userEmail: string;

    @Column({nullable: true})
    public userMobilePhone: string;

    @CreateDateColumn()
    public dateCreate: Date;

    @Column({nullable: true})
    public dateLastlogin: Date;

    @Column({nullable: true})
    public userLastIp: string;

    @OneToMany(() => UsersRights, usersRights => usersRights.user)
    public usersRights: UsersRights[];
}
