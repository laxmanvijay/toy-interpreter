export class Emitter {
    private header = '';
    private code = '';
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
        if (!err) this.element.innerHTML = this.header + this.code;
        else this.element.innerHTML = `<p class='err'>${errText}</p>`;
    }
}
