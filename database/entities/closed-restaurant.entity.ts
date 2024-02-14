import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'closed_restaurant' })
export class ClosedRestaurant {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    city: string

    @Column({nullable: true})
    old_address: string

    @Column({nullable: true})
    new_address: string

    @Column({nullable: true})
    lat: string

    @Column({nullable: true})
    lon: string

    @Column()
    is_open: boolean

    @Column()
    in_date: string

    @Column()
    name: string

    @Column()
    category: string
}