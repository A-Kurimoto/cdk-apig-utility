export class SampleDao {

    /**
     * This is sample method.
     *
     * @param limit
     * @param sort
     1：ascending
     2：descending
     * @param word some word
     * @param isSomeFlg some boolean value1
     * @param someArray some array
     */
    async getSomething1(limit: number, offset: number, sort: number, word?: string, isSomeFlg?: boolean,
                        someArray?: string[]): Promise<any> {

    }

    /**
     *
     * @param limit Description of the limit
     */
    getSomething2(limit: number): any {

    }

}
