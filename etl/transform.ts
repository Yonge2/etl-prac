import dataSource from "../database/data-source"
import { OpenRestaurant } from "../database/entities/open-restaurant.entity"
import { ClosedRestaurant } from "../database/entities/closed-restaurant.entity"

/**
 * SIGUN_NM -> city : 시군명 
 * REFINE_LOTNO_ADDR -> old_address : 구주소 
 * REFINE_ROADNM_ADDR -> new_address : 신주소 
 * REFINE_WGS84_LAT -> lat : 위도 
 * REFINE_WGS84_LOGT -> lon : 경도 
 * BSN_STATE_NM -> is_open : 폐업 여부 '폐업'|'영업' 
 * LICENSG_DE -> in_date : 등록일 
 * BIZPLC_NM -> name : 상호명 
 * SANITTN_BIZCOND_NM -> category : 업종 (분식, 양식 ...) 
 */

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