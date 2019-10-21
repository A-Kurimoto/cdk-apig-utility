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
}
