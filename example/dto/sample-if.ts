import {SubIf} from './sub/sub-if';

export interface SampleIf {
    /**
     * @desc JSDoc of param1
     */
    param1: string;
    /**
     * @description JSDoc of param2
     */
    param2: number;
    /**
     * ignored comment of param3
     */
    param3: boolean;
    param4: string[];
    param5: number[];
    param6: boolean[];
    param7: SubIf;
    param8: SubIf[];
    param9: object;
    param10: object[];
    param11: null;
    param12: null[];
    param13: string[][];
    /**
     * accepted union type.
     */
    paramUnion1?: string;
    /**
     * accepted union type.
     */
    paramUnion2: undefined | string;
    /**
     * accepted union type.
     */
    paramUnion3: null | SubIf;
    /**
     * accepted union type.
     */
    paramUnion4: null | undefined | SubIf[];
    /**
     * ignored union type.
     */
    paramUnion5: null | number | string;
    /**
     * ignored union type.
     */
    paramUnion6: undefined | number | string;
}
