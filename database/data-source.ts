import { DataSource } from 'typeorm'

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'etl_user',
  password: '123a',
  database: 'etl_db',
  entities: [__dirname + '/entities/*.{ts,js}'],
  dropSchema:true,
  synchronize: true,
  logging: true,
  timezone: '+09.00',
})