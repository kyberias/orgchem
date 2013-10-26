/* lexical grammar */
%start iupacname
%%

iupacname 
    : PLIST infix rootword primarysuffix secondarysuffix
        { return { prefix: $1, infix: $2, rootword: $3, primarysuffix: $4 }; }
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
        { $$ = $1; }
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
/*
4-etyyli-5-(1,2-dimetyylibutyyli)nonaani
*/

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
    'cyclo'
    | 'spiro'
    | 'bicyclo'
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
    ;

primarysuffix
    : 'aani' { $$ = 'aani' }
    | 'an' { $$ = 'an' }
    | 'eeni' { $$ = 'eeni' }
    | '-' NUMBER '-' 'eeni' { $$ = 'eeni' }
    | 'yyni' { $$ = 'yyni' }
    | '-' NUMBER '-' 'yyni' { $$ = 'yyni' }
    ;

secondarysuffix
    : '-' numberlist '-' 'oli' { $$ = 'oli' }
    | 
    'oli' { $$ = 'oli' }
    |
    ;

numberlist
    : NUMBER 
    { $$ = [$1] }
    | numberlist ',' NUMBER
    { $$ =  $1.concat([$3]); }
    ;
