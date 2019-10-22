export class SubClass {
    subClassParam1: string;
    subClassParam2: object;
    subClassParam3: null;
    subClassParam4: null[];
    /**
     * ignored union type.
     */
    subClassParamUnion: null | undefined | string;

    /**
     * ignored
     */
    constructor() {
        this.subClassParam1 = '';
        this.subClassParam2 = {};
        this.subClassParam3 = null;
        this.subClassParam4 = [null, null];
    }

}
