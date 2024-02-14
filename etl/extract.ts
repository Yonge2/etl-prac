import axios from "axios"

/**
 * 데이터 추출 클래스
 */
export class ExtractData {
    private baseUrl: string

    private SAMPLE_PAGE = '&pSize=1&pIndex=1'
    private page = (index:number) => `&pSize=1000&pIndex=${index}`

    private SUCCESS_CODE = 'INFO-000'

    constructor(key: string){
        this.baseUrl = `https://openapi.gg.go.kr/GENRESTRT?Key=${key}&Type=json`
    }

    async extractSampleData(){
        const url = this.baseUrl + this.SAMPLE_PAGE
        try{
            const sampleData = await axios.get(url)
            
            const responseCode: string = sampleData.data['GENRESTRT'][0]['head'][1]['RESULT']['CODE']
            const totalCount: number = sampleData.data['GENRESTRT'][0]['head'][0]['list_total_count']
            if(this.SUCCESS_CODE!=responseCode || !totalCount){
                throw new Error('비정상 응답')
            }
            const data = sampleData.data['GENRESTRT'][1]['row'][0]

            return {totalCount, data: [data]}
        }catch(e){
            return e
        }
    }

    /**
     * pageIndex 1부터 +1000씩
     */
    async extractData1000(pageIndex: number){
        const url = this.baseUrl + this.page(pageIndex)
        try{
            const responseData = await axios.get(url)

            const responseCode: string = responseData.data['GENRESTRT'][0]['head'][1]['RESULT']['CODE']
            if(this.SUCCESS_CODE!=responseCode){
                throw new Error('비정상 응답')
            }
            const data = responseData.data['GENRESTRT'][1]['row']

            return {data}
        }catch(e){
            return e
        }
    }
}