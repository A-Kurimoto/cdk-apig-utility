export class SampleClass {
    param1: string;
    readonly param2: string;

    /**
     * ignored
     */
    constructor(param1: string, param2: string) {
        this.param1 = param1;
        this.param2 = param2;
        this.func2();
    }

    /**
     * ignored
     */
    static staticFunction(hpge: string): void {

    }

    /**
     * ignored
     */
    func1(): string[] {
        return [];
    }

    /**
     * ignored
     */
    private func2() {

    }

}
