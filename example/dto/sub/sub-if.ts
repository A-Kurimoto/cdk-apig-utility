import {SubClass} from './sub-class';

export interface SubIf {
    subParam1: string;
    subParam2: object;
    subParam3: null;
    subParam4: null[];
    subParam5: SubClass;
    subParam6: SubClass[];
    /**
     * ignored union type.
     */
    subParam7: null | undefined | string;
}
