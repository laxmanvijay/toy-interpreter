import { IToken, TokenType } from './tokens';

export class Lexer {
    private input: string;
    private currentChar: string;
    private currentPos: number;

    constructor(code: string) {
        this.input = code + '\n';

        this.currentChar = '';
        this.currentPos = -1;
        this.forward();
    }

    public getCurrentChar(): string {
        return this.currentChar;
    }

    /**
     * nextChar gets the next character from the input stream
     */
    public forward(): void {
        this.currentPos++;

        if (this.currentPos >= this.input.length) {
            this.currentChar = '\0';
        } else {
            this.currentChar = this.input[this.currentPos];
        }
    }

    /**
     * backward moves one step back
     */
    public backward(): void {
        this.currentPos--;
        this.currentChar = this.input[this.currentPos];
    }

    /**
     * peek gets the lookahead character
     */
    public peek(): string {
        if (this.currentPos + 1 >= this.input.length) return '\0';
        return this.input[this.currentPos + 1];
    }

    /**
     * abort
     */
    public abort(message: string): void {
        throw new Error(message);
    }

    public skipComments(): void {
        if (this.input[this.currentPos] === '#') {
            while (this.currentChar !== '\n') this.forward();
        }
    }

    public skipWhitespace(): void {
        while (this.currentChar === ' ' || this.currentChar === '\t' || this.currentChar === '\r') this.forward();
    }

    /**
     * lex
     */
    public getToken(): IToken {
        this.skipWhitespace();
        this.skipComments();

        let token: IToken;
        switch (this.currentChar) {
            case '+':
                token = this.buildTokenObj(this.currentChar, TokenType.PLUS);
                break;
            case '-':
                token = this.buildTokenObj(this.currentChar, TokenType.MINUS);
                break;
            case '*':
                token = this.buildTokenObj(this.currentChar, TokenType.ASTERISK);
                break;
            case '/':
                token = this.buildTokenObj(this.currentChar, TokenType.SLASH);
                break;
            case '=':
                if (this.peek() === '=') {
                    const lastChar: string = this.currentChar;
                    this.forward();
                    token = this.buildTokenObj(lastChar + this.currentChar, TokenType.EQEQ);
                } else token = this.buildTokenObj(this.currentChar, TokenType.EQ);
                break;
            case '>':
                if (this.peek() === '=') {
                    const lastChar: string = this.currentChar;
                    this.forward();
                    token = this.buildTokenObj(lastChar + this.currentChar, TokenType.GTEQ);
                } else token = this.buildTokenObj(this.currentChar, TokenType.GT);
                break;
            case '<':
                if (this.peek() === '=') {
                    const lastChar: string = this.currentChar;
                    this.forward();
                    token = this.buildTokenObj(lastChar + this.currentChar, TokenType.LTEQ);
                } else token = this.buildTokenObj(this.currentChar, TokenType.LT);
                break;
            case '!':
                if (this.peek() === '=') {
                    const lastChar: string = this.currentChar;
                    this.forward();
                    token = this.buildTokenObj(lastChar + this.currentChar, TokenType.NQ);
                } else token = this.buildTokenObj(this.currentChar, TokenType.NOT);
                break;
            case '"':
                this.forward();
                const startPos: number = this.currentPos;

                while (this.currentChar !== '"') {
                    this.forward();
                }
                token = this.buildTokenObj(this.input.substring(startPos, this.currentPos), TokenType.STRING);
                break;
            case '\n':
                token = this.buildTokenObj(this.currentChar, TokenType.NEWLINE);
                break;
            case '\0':
                token = this.buildTokenObj(this.currentChar, TokenType.EOF);
                break;
            default:
                if (this.isDigit(this.currentChar)) {
                    const startPos = this.currentPos;
                    this.forward();
                    while (this.isDigit(this.currentChar)) {
                        this.forward();
                    }
                    if (this.currentChar === '.') {
                        this.forward();
                        while (this.isDigit(this.currentChar)) this.forward();
                    }
                    token = this.buildTokenObj(this.input.substring(startPos, this.currentPos), TokenType.NUMBER);
                    this.backward();
                } else if (this.isLetter(this.currentChar)) {
                    const startPos = this.currentPos;
                    this.forward();

                    while (this.isLetter(this.currentChar)) this.forward();

                    const ident: string = this.input.substring(startPos, this.currentPos);

                    this.backward();
                    token =
                        ident in TokenType
                            ? this.buildTokenObj(ident, <TokenType>ident)
                            : this.buildTokenObj(ident, TokenType.IDENT);
                } else {
                    token = this.buildTokenObj(`Unknown token: ${this.currentChar}`, TokenType.UNK);
                }
                break;
        }
        this.forward();

        return token;
    }

    private isLetter(c: string): boolean {
        return c.match(/[a-z]/i) !== null;
    }

    private isDigit(c: string): boolean {
        if (c >= '0' && c <= '9') {
            return true;
        }
        return false;
    }

    private buildTokenObj(value: string, type: TokenType): IToken {
        return {
            value: value,
            type: type,
        };
    }
}
