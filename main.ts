import dataSource from "./database/data-source"
import { ExtractData } from "./etl/extract"
import { Transform } from "./etl/transform"
import * as dotenv from 'dotenv'

dotenv.config()

const run = async() => {
    await dataSource.initialize()

    const apiKey = process.env.API_KEY
    let pageIndex = 1

    const extract = new ExtractData(apiKey)
    const transform = new Transform()

    //이후 데이터 요청 시 pageIndex += 1000
    const extractData = await extract.extractData1000(pageIndex)
    const result = await transform.transformData(extractData.data)
    
    console.log(result)
}
run()