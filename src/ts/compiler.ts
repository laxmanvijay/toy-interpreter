import { Emitter } from './emitter';
import { Lexer } from './lexer';
import { Parser } from './parser';

// const testInput = 'LET a = 1';

let program;
const output = <HTMLDivElement>document.getElementById('out');
let emitter: Emitter;

document.getElementById('btn').addEventListener('click', () => {
    try {
        program = (<HTMLInputElement>document.getElementById('text')).value;

        const lexer = new Lexer(program);

        emitter = new Emitter(output);

        const parser = new Parser(lexer, emitter);

        parser.parse();

        emitter.write();

        // let tok = lexer.getToken();
        // console.log(tok);

        // while (tok.type !== TokenType.EOF) {
        //     console.log(tok);
        //     tok = lexer.getToken();

        // }
    } catch (error) {
        emitter.write(true, error);
        output.style.backgroundColor = 'rgb(238, 192, 192)';
        console.error(error);
    }
});
