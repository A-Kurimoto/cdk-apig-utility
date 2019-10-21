import {SubRequest} from './sub/sub-request';

export interface SampleRequest {
    /**
     * @desc jsDoc of param1
     */
    param1: string;
    /**
     * @description jsDoc of param2
     */
    param2: number;
    /**
     * ignored comment of param3
     */
    param3: boolean;
    param4: string[];
    param5: number[];
    param6: boolean[];
    param7: SubRequest;
    param8: SubRequest[];
}
