import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'open_restaurant' })
export class OpenRestaurant {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    city: string

    @Column()
    old_address: string

    @Column()
    new_address: string

    @Column()
    lat: string

    @Column()
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