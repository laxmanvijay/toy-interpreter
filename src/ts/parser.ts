/**
 *
 * The following represents the grammar for the language.
 *
 * program -> statement*
 * statement -> "print" (expression | string) nl
 *   | "if" comparison "then" nl statement* "endif" nl
 *   | "while" comparison "repeat" nl statement* "endwhile" nl
 *   | "label" ident nl
 *   | "goto" ident nl
 *   | "let" ident "=" expression nl
 * comparison -> expression (("==" | "!=" | ">" | ">=" | "<" | "<=") expression)+
 * expression -> term (( "-" | "+" ) term)*
 * term -> unary (( "/" | "*" ) unary)*
 * unary -> ("+" | "-")? primary
 * primary -> number | ident
 * nl -> '\n'+
 */

import { Emitter } from './emitter';
import { Lexer } from './lexer';
import { IToken, TokenType } from './tokens';

export class Parser {
    private currentToken: IToken;
    private peekToken: IToken;
    private variablesDeclared: string[] = [];
    private labelsDeclared: string[] = [];
    private labelsUsed: string[] = [];

    constructor(private lexer: Lexer, private emitter: Emitter) {
        this.nextToken();
        this.nextToken();
    }

    public checkToken(type: TokenType): boolean {
        return this.currentToken.type === type;
    }

    public checkPeek(type: TokenType): boolean {
        return this.peekToken.type === type;
    }

    public matchAndMove(type: TokenType[], move = true): void {
        const errConstruct: string = type.map((x, i) => `${x} ${i < type.length - 1 ? ' or ' : ''} `).join('');

        if (!type.some((x) => this.currentToken.type === x)) this.abort(errConstruct);
        if (move) this.nextToken();
    }
    public nextToken(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.getToken();
    }

    /**
     * parse method parses the code
     */
    public parse(): void {
        console.log('parsing begun');

        this.emitter.emitHeader('#include "stdio.h"');
        this.emitter.emitHeader('int main(){');

        while (this.checkToken(TokenType.NEWLINE)) this.nextToken();

        this.program();

        if (this.variablesDeclared.length > 0)
            this.emitter.emitHeader(`float ${this.variablesDeclared.map((x) => x).join()};`);

        this.emitter.emitAndAppendNewLine('return 0;');
        this.emitter.emitAndAppendNewLine('}');
    }

    // program -> statement
    private program(): void {
        while (!this.checkToken(TokenType.EOF)) this.statement();

        this.labelsUsed
            .filter((x) => !this.labelsDeclared.includes(x))
            .forEach((x) => {
                this.abort(`attempting to use undeclared label: ${x}`);
            });
    }

    /**
     * Statement supports seven different types of rules.
     *
     * statement -> "print" (expression | string) nl
     *   | "if" comparison "THEN" nl statement* "ENDIF" nl
     *   | "while" comparison "REPEAT" nl statement* "ENDWHILE" nl
     *   | "label" ident nl
     *   | "goto" ident nl
     *   | "let" ident "=" expression nl
     */
    private statement(): void {
        // statement -> "print" (expression | string) nl
        if (this.checkToken(TokenType.print)) {
            this.nextToken();
            this.matchAndMove([TokenType.STRING, TokenType.IDENT], false);

            if (this.checkToken(TokenType.STRING)) {
                this.emitter.emitAndAppendNewLine(`printf("${this.currentToken.value}\\n");`);
                this.nextToken();
            } else {
                this.emitter.emit(`printf("%" + ".2f\\n", (float)(`);
                this.expression();
                this.emitter.emitAndAppendNewLine(`));`);
            }
        } else if (this.checkToken(TokenType.if)) {
            // "if" comparison "then" nl statement* "endif" nl
            this.nextToken();
            this.emitter.emit('if(');
            this.comparison();
            this.matchAndMove([TokenType.then]);
            this.newLine();
            this.emitter.emitAndAppendNewLine(') {');

            while (!this.checkToken(TokenType.endif)) this.statement();

            this.matchAndMove([TokenType.endif]);
            this.emitter.emitAndAppendNewLine('}');
        } else if (this.checkToken(TokenType.while)) {
            // "while" comparison "repeat" nl statement* "endwhile" nl
            this.nextToken();
            this.emitter.emit('while(');
            this.comparison();
            this.matchAndMove([TokenType.repeat]);
            this.newLine();
            this.emitter.emitAndAppendNewLine(') {');

            while (!this.checkToken(TokenType.endwhile)) this.statement();

            this.matchAndMove([TokenType.endwhile]);
            this.emitter.emitAndAppendNewLine('}');
        } else if (this.checkToken(TokenType.label)) {
            // "label" ident nl
            this.nextToken();

            if (this.labelsDeclared.includes(this.currentToken.value))
                this.abort(`label redeclaration: ${this.currentToken.value}`);
            else this.labelsDeclared.push(this.currentToken.value);

            this.emitter.emitAndAppendNewLine(this.currentToken.value + ':');
            this.matchAndMove([TokenType.IDENT]);
        } else if (this.checkToken(TokenType.goto)) {
            // "goto" ident nl
            this.nextToken();

            this.labelsUsed.push(this.currentToken.value);

            this.emitter.emitAndAppendNewLine('goto ' + this.currentToken.value + ';');
            this.matchAndMove([TokenType.IDENT]);
        } else if (this.checkToken(TokenType.let)) {
            // "let" ident "=" expression nl
            this.nextToken();

            if (!this.variablesDeclared.includes(this.currentToken.value))
                this.variablesDeclared.push(this.currentToken.value);

            this.emitter.emit(`${this.currentToken.value} = `);
            this.matchAndMove([TokenType.IDENT]);

            this.matchAndMove([TokenType.EQ]);
            this.expression();
            this.emitter.emitAndAppendNewLine(';');
        } else {
            if (this.checkToken(TokenType.NEWLINE)) while (this.checkToken(TokenType.NEWLINE)) this.nextToken();
            else this.abort(this.currentToken.value);
        }

        // this.newLine();
    }

    // comparison -> expression (("==" | "!=" | ">" | ">=" | "<" | "<=") expression)+
    private comparison(): void {
        this.expression();

        if (this.isComparisonOperator()) {
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
            this.expression();
        } else {
            this.abort(`Expected comparison operator: ${this.currentToken.value}`);
        }

        while (this.isComparisonOperator()) {
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
            this.expression();
        }
    }

    private isComparisonOperator(): boolean {
        return (
            this.checkToken(TokenType.GT) ||
            this.checkToken(TokenType.GTEQ) ||
            this.checkToken(TokenType.LT) ||
            this.checkToken(TokenType.LTEQ) ||
            this.checkToken(TokenType.EQEQ) ||
            this.checkToken(TokenType.NQ)
        );
    }

    // expression -> term (( "-" | "+" ) term)*
    private expression(): void {
        this.term();

        while (this.checkToken(TokenType.MINUS) || this.checkToken(TokenType.PLUS)) {
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
            this.term();
        }
    }

    // term -> unary (( "/" | "*" ) unary)*
    private term(): void {
        this.unary();

        while (this.checkToken(TokenType.SLASH) || this.checkToken(TokenType.ASTERISK)) {
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
            this.unary();
        }
    }

    // unary -> ("+" | "-")? primary
    private unary(): void {
        if (this.checkToken(TokenType.PLUS) || this.checkToken(TokenType.MINUS)) {
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
        }
        this.primary();
    }

    // primary -> number | ident
    private primary(): void {
        if (this.checkToken(TokenType.NUMBER)) {
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
        } else if (this.checkToken(TokenType.IDENT)) {
            if (!this.variablesDeclared.includes(this.currentToken.value))
                this.abort(`undeclared variable: ${this.currentToken.value}`);
            this.emitter.emit(this.currentToken.value);
            this.nextToken();
        } else this.abort(`Unexpected token at: ${this.currentToken.value}`);
    }

    // requires atleast one newline after every statement, there can be many
    private newLine(): void {
        this.matchAndMove([TokenType.NEWLINE]);

        while (this.checkToken(TokenType.NEWLINE)) this.nextToken();
    }

    private abort(msg: string): void {
        throw new Error(`Syntax error: ${msg}`);
    }
}
