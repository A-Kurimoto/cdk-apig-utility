import {SubRequest} from './sub-request';

export interface SampleRequest {
    param1: string;
    param2: number;
    param3: boolean;
    param4: string[];
    param5: number[];
    param6: boolean[];
    param7: SubRequest;
    param8: SubRequest[];
}
