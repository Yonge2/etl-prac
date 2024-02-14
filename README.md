# etl-prac

## 개요
경기데이터 드림 open API를 활용하여 경기도 음식점 데이터를  
추출, 변형 후 데이터 베이스에 저장하는 데이터 파이프라인 입니다.

 - schduler를 사용하여 batch 프로그램을 만들 수 있습니다.
 - sample data를 요청하여, 목적에 맞게 프로그램을 수정하여 사용할 수 있습니다. (sample data 에 총 데이터 수 포함)

## 데이터
[경기데이터드림 - 음식점 현황](https://data.gg.go.kr/portal/data/service/selectServicePage.do?page=1&rows=10&sortColumn=&sortDirection=&infId=Q5FEF7YLDX69L0Z9A1PL25845033&infSeq=1&order=&loc=&searchWord=%EC%9D%8C%EC%8B%9D%EC%A0%90)

## 사용 기술 및 환경
RunTime - Node.js 20.9
DB - MySQL 8.0 / TypeORM - 0.3

## 실행 방법
저장소를 복사 합니다.
```
git clone https://github.com/Yonge2/etl-prac.git
```
사용 패키지 설치 후, 실행합니다.
```
npm i

npm run start
```

## 동작 흐름
![flow](https://github.com/Yonge2/etl-prac/assets/99579139/5e7a29e7-5c69-46b6-8461-f9fe5cc7021f)

## 상세 코드
### 추출
헤더 값을 통해 get 성공 여부를 판단합니다.  
한 번에 1000개씩 get 할 수 있으므로, page를 설정하여 url에 합쳐서 요청 합니다.
```javascript
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
```
### 변형&적재
데이터를 정재하여 비동기적으로 transaction을 commit 하거나, 오류 발생 시, rollback을 합니다.
```javascript
export class Transform {

    async transformData(data: any[]){
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try{
            const promises = data.map(async (ele)=>{
                const insertOne = {
                    city: ele.SIGUN_NM,
                    old_address: ele.REFINE_LOTNO_ADDR,
                    new_address: ele.REFINE_ROADNM_ADDR,
                    lat: ele.REFINE_WGS84_LAT,
                    lon: ele.REFINE_WGS84_LOGT,
                    is_open: (ele.BSN_STATE_NM==='영업') ? true : (ele.BSN_STATE_NM==='폐업') ? false : undefined,
                    in_date: ele.LICENSG_DE,
                    name: ele.BIZPLC_NM,
                    category: ele.SANITTN_BIZCOND_NM
                }
                //영업중
                if(insertOne.is_open){
                    return await dataSource.manager.insert(OpenRestaurant, insertOne)
                }
                return await dataSource.manager.insert(ClosedRestaurant, insertOne)
            })
            await Promise.all(promises)
            await queryRunner.commitTransaction()

            return {
                success: true, 
                message : `데이터 ${promises.length} 개 삽입 성공`
            }
        }catch(e){
            await queryRunner.rollbackTransaction()
            return {
                success: false, 
                message : e
            }
        }finally{
            queryRunner.release()
        }
    }
}
```

## 테스트
![결과](https://github.com/Yonge2/etl-prac/assets/99579139/c68f89fb-5cc4-4376-9c94-aa2468614744)