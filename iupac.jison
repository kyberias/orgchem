/* lexical grammar */
%start iupacname
%%

iupacname 
    : PLIST infix rootword primarysuffix secondarysuffix
        { return { prefix: $1, infix: $2, rootword: $3, primarysuffix: $4, secondarysuffix: $5 }; }
        ;

PLIST:
    PL 
        { $$ = $1; }
    | ;

 PL :
    PR
        { $$ = [$1]; }
    |
    PL '-' PR
        { $$ = $1.concat([$3]); }
    ;

PR:
    prefixname
        { $$ = { name: $1 }; }
    |
    numberlist '-' prefixname
        { $$ = { numberList: $1, name: $3 }; }
    |
    numberlist '-' prefixnum prefixname
        { $$ = { numberList: $1, num: $3, name: $4 }; }
    |
    numberlist '-' prefixnum2 '(' PL2 ')'
        { $$ = { numberList: $1, num: $3, name: $4 }; }
    ;

PL2:
    PR
        { $$ = [$1]; }
    |
    PL2 PR
        { $$ = [$1].concat($2); }
    ;

prefixnum2:
    'bis' | 'tris' | 'tetrakis'
    |
    ;

prefixnum:
    'di' | 'tri' | 'iso'
    ;

prefixname:
    'metyyli'
            { $$ = 'metyyli' }
    |
    'etyyli'
            { $$ = 'etyyli' }
    |
    'butyyli'
            { $$ = 'butyyli' }
    |
    'propyyli'
            { $$ = 'propyyli' }
    ;

infix:
    'cyclo' { $$ = 'cyclo' }
    | 
    'spiro' { $$ = 'spiro' }
    | 
    'bicyclo'{ $$ = 'bicyclo' }
    |
    ;

rootword
    : 'met' 
        { $$ = 1 }
     | 'et' 
        { $$ = 2 }
     | 'prop'
        { $$ = 3 }
     | 'but'
        { $$ = 4 }
     | 'pent'
        { $$ = 5 }
     | 'heks'
        { $$ = 6 }
     | 'hept'
        { $$ = 7 }
     | 'okt'
        { $$ = 8 }
     | 'non'
        { $$ = 9 }
     | 'dek'
        { $$ = 10 }
     | 'undek'
        { $$ = 11 }
     | 'dodek'
        { $$ = 12 }
     | 'tridek'
        { $$ = 13 }
     | 'tetradek'
        { $$ = 14 }
     | 'pentadek'
        { $$ = 15 }
     | 'eikos'
        { $$ = 20 }
     | 'triakont'
        { $$ = 30 }
     | 'tetrakont'
        { $$ = 40 }
     | 'pentakont'
        { $$ = 50 }
    ;

primarysuffix
    : 'aani' { $$ = { type: 'aani' } }
    | 'an' { $$ = { type: 'aani' } }
    | 'eeni' { $$ = { type: 'eeni' } }
    | '-' numberlist '-' 'eeni' { $$ = { type: 'eeni', numberlist: $2 } }
    | 'yyni' { $$ = { type: 'yyni' } }
    | '-' numberlist '-' 'yyni' { $$ = { type: 'yyni', numberlist: $2 } }
    ;

secondarysuffix
    : '-' numberlist '-' 'oli' { $$ = { name: 'oli', numberlist: $2 } }
    | 
    'oli' { $$ = { name: 'oli' } }
    |
    ;

numberlist
    : NUMBER 
    { $$ = [$1]; }
    | numberlist ',' NUMBER
    { $$ =  $1.concat([$3]); }
    ;

NUMBER
    : numeral NUMBER 
        { $$ = parseInt($1 + $2); }
    |
    numeral
        { $$ = parseInt($1); }
        ;

numeral:
    '0' { $$ = '0'; }
    | '1' { $$ = '1'; }
    |'2' { $$ = '2'; }
    |'3' { $$ = '3'; }
    |'4' { $$ = '4'; }
    |'5' { $$ = '5'; }
    |'6' { $$ = '6'; }
    |'7' { $$ = '7'; }
    |'8' { $$ = '8'; }
    | '9' { $$ = '9'; }
    ;
