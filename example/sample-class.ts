export class SampleClass {
    param1: string;
    readonly param2: string;

    constructor(param1: string, param2: string) {
        this.param1 = param1;
        this.param2 = param2;
        this.func2();
    }

    static staticFunction(hpge: string): void {

    }

    func1(): string[] {
        return [];
    }

    private func2() {

    }

}
