import { Emitter } from './emitter';
import { Lexer } from './lexer';
import { Parser } from './parser';

// const testInput = 'LET a = 1';

let program;
const output = <HTMLDivElement>document.getElementById('out');
const res = <HTMLDivElement>document.getElementById('result');
const errColor = 'rgb(238, 192, 192)';

let emitter: Emitter;

document.getElementById('btn').addEventListener('click', () => {
    try {
        program = (<HTMLInputElement>document.getElementById('text')).value;

        const lexer = new Lexer(program);

        emitter = new Emitter(output);

        const parser = new Parser(lexer, emitter);

        parser.parse();

        emitter.write();

        const oldLog = console.log;
        console.log = function (value: unknown) {
            oldLog(value);
            return value;
        };

        try {
            res.innerHTML = eval(emitter.finalCode.replace(/<br>/g, ''));
        } catch (err) {
            res.innerHTML = `<p class='err'>${err}</p>`;
            res.style.backgroundColor = errColor;
        }

        // let tok = lexer.getToken();
        // console.log(tok);

        // while (tok.type !== TokenType.EOF) {
        //     console.log(tok);
        //     tok = lexer.getToken();

        // }
    } catch (error) {
        emitter.write(true, error);
        output.style.backgroundColor = errColor;
        console.error(error);
    }
});
