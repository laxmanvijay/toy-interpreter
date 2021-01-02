export class Emitter {
    private header = '';
    private _code = '';
    public finalCode: string;

    public get code(): string {
        return this._code;
    }
    public set code(value: string) {
        this._code = value;
    }

    constructor(private element: HTMLDivElement) {}

    public emit(code: string): void {
        this.code += code;
    }

    public emitAndAppendNewLine(code: string): void {
        this.code += code + '<br>';
    }

    public emitHeader(header: string): void {
        this.header += header + '<br>';
    }

    public write(err?: boolean, errText?: string): void {
        this.finalCode = this.header + this.code;
        if (!err) this.element.innerHTML = this.finalCode;
        else this.element.innerHTML = `<p class='err'>${errText}</p>`;
    }
}
