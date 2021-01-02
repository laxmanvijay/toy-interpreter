export enum TokenType {
    let = 'let',
    if = 'if',
    then = 'then',
    endif = 'endif',
    while = 'while',
    repeat = 'repeat',
    endwhile = 'endwhile',
    print = 'print',
    label = 'label',
    goto = 'goto',

    EOF = 'EOF',
    NEWLINE = 'NEWLINE',
    IDENT = 'IDENT',
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    UNK = 'UNK',

    EQ = 'EQ',
    GT = 'GT',
    LT = 'LT',
    GTEQ = 'GTEQ',
    LTEQ = 'LTEQ',
    EQEQ = 'EQEQ',
    NQ = 'NQ',
    NOT = 'NOT',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    ASTERISK = 'ASTERISK',
    SLASH = 'SLASH',
}

export interface IToken {
    value: string;
    type: TokenType;
}
