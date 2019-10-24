export class SampleDao {


    /**
     * Sampleです。
     *
     * @param limit
     * @param offset
     * @param sort
     1：昇順
     2：降順
     * @param word 検索語句
     * @param isSomeFlg
     * @param prefectureCodes 都道府県コードの配列
     */
    async getSomething(limit: number, offset: number, sort: number, word?: string, isSomeFlg?: boolean,
                       prefectureCodes?: string[]): Promise<any> {
  
    }

}
