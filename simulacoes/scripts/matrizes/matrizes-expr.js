// =============================================================================
// Autor: Nicolas Heringer
// Projeto: Simulações Matemáticas & Científicas (Design System 2.0)
// Arquivo: matrizes-expr.js
// Parser e Compilador Seguro de Expressões Matemáticas em f(x, y, t)
// Sem uso de eval() ou new Function com código arbitrário
// =============================================================================

/**
 * Tokeniza e compila uma expressão matemática em uma função JavaScript pura e rápida.
 * Suporta x, y, t, constantes (pi, e), funções trigonométricas e transcendentais.
 */

const CONSTANTS = {
    pi: Math.PI,
    e: Math.E
};

const FUNCTIONS = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    exp: Math.exp,
    log: Math.log,
    ln: Math.log,
    sqrt: Math.sqrt,
    abs: Math.abs,
    floor: Math.floor,
    ceil: Math.ceil,
    round: Math.round,
    sign: Math.sign,
    min: Math.min,
    max: Math.max
};

const OPERATORS = {
    '+': { prec: 1, assoc: 'L', exec: (a, b) => a + b },
    '-': { prec: 1, assoc: 'L', exec: (a, b) => a - b },
    '*': { prec: 2, assoc: 'L', exec: (a, b) => a * b },
    '/': { prec: 2, assoc: 'L', exec: (a, b) => (b === 0 ? NaN : a / b) },
    '%': { prec: 2, assoc: 'L', exec: (a, b) => a % b },
    '^': { prec: 3, assoc: 'R', exec: (a, b) => Math.pow(a, b) },
    'u-': { prec: 4, assoc: 'R', exec: (a) => -a },
    'u+': { prec: 4, assoc: 'R', exec: (a) => +a }
};

/**
 * Tokeniza a string de entrada.
 */
function tokenize(str) {
    const tokens = [];
    let i = 0;
    const len = str.length;

    while (i < len) {
        const c = str[i];

        if (/\s/.test(c)) {
            i++;
            continue;
        }

        // Números (inteiros ou decimais)
        if (/[0-9]/.test(c) || (c === '.' && i + 1 < len && /[0-9]/.test(str[i + 1]))) {
            let numStr = '';
            while (i < len && /[0-9.]/.test(str[i])) {
                numStr += str[i++];
            }
            tokens.push({ type: 'number', value: parseFloat(numStr) });
            continue;
        }

        // Identificadores (variáveis, constantes, funções)
        if (/[a-zA-Z_]/.test(c)) {
            let id = '';
            while (i < len && /[a-zA-Z0-9_]/.test(str[i])) {
                id += str[i++];
            }
            id = id.toLowerCase();
            tokens.push({ type: 'ident', value: id });
            continue;
        }

        // Operadores de 1 caractere ou parênteses / vírgulas
        if (c === '(' || c === ')' || c === ',') {
            tokens.push({ type: c, value: c });
            i++;
            continue;
        }

        if ('+-*/%^'.includes(c)) {
            tokens.push({ type: 'op', value: c });
            i++;
            continue;
        }

        throw new Error(`Caractere inválido: "${c}"`);
    }

    // Inserção de multiplicação implícita (ex: 2x -> 2*x, 3(x) -> 3*(x), x y -> x*y)
    const expanded = [];
    for (let k = 0; k < tokens.length; k++) {
        const curr = tokens[k];
        const next = tokens[k + 1];
        expanded.push(curr);

        if (!next) break;

        const isCurrOperand = curr.type === 'number' || (curr.type === 'ident' && !FUNCTIONS[curr.value]) || curr.type === ')';
        const isNextOperand = next.type === 'number' || next.type === 'ident' || next.type === '(';

        if (isCurrOperand && isNextOperand) {
            expanded.push({ type: 'op', value: '*' });
        }
    }

    return expanded;
}

/**
 * Converte tokens em notação polonesa reversa (RPN) via Shunting-Yard.
 */
function toRPN(tokens) {
    const output = [];
    const opStack = [];
    let prevToken = null;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'number') {
            output.push(token);
        } else if (token.type === 'ident') {
            if (FUNCTIONS[token.value]) {
                opStack.push({ type: 'fn', value: token.value });
            } else if (CONSTANTS[token.value] !== undefined || ['x', 'y', 't'].includes(token.value)) {
                output.push(token);
            } else {
                throw new Error(`Variável ou função desconhecida: "${token.value}"`);
            }
        } else if (token.type === ',') {
            while (opStack.length && opStack[opStack.length - 1].type !== '(') {
                output.push(opStack.pop());
            }
            if (!opStack.length) {
                throw new Error('Vírgula fora de argumentos de função');
            }
        } else if (token.type === 'op') {
            let op = token.value;
            // Distingue operador unário vs binário (+ e -)
            const isUnary = !prevToken || prevToken.type === '(' || prevToken.type === 'op' || prevToken.type === ',';
            if (isUnary) {
                if (op === '-') op = 'u-';
                else if (op === '+') op = 'u+';
                else throw new Error(`Operador unário inválido: "${op}"`);
            }

            const opInfo = OPERATORS[op];
            while (opStack.length) {
                const top = opStack[opStack.length - 1];
                if (top.type === 'fn') {
                    output.push(opStack.pop());
                } else if (top.type === 'op') {
                    const topInfo = OPERATORS[top.value];
                    if ((opInfo.assoc === 'L' && opInfo.prec <= topInfo.prec) ||
                        (opInfo.assoc === 'R' && opInfo.prec < topInfo.prec)) {
                        output.push(opStack.pop());
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            opStack.push({ type: 'op', value: op });
        } else if (token.type === '(') {
            opStack.push(token);
        } else if (token.type === ')') {
            while (opStack.length && opStack[opStack.length - 1].type !== '(') {
                output.push(opStack.pop());
            }
            if (!opStack.length) {
                throw new Error('Parênteses não balanceados');
            }
            opStack.pop(); // Remove '('
            if (opStack.length && opStack[opStack.length - 1].type === 'fn') {
                output.push(opStack.pop());
            }
        }

        prevToken = token;
    }

    while (opStack.length) {
        const top = opStack.pop();
        if (top.type === '(' || top.type === ')') {
            throw new Error('Parênteses não balanceados');
        }
        output.push(top);
    }

    return output;
}

/**
 * Compila a fila RPN em uma função avaliadora rápida: (x, y, t) => number
 */
function compileRPN(rpn) {
    // Para performance máxima durante renderização de grids densos,
    // criamos uma máquina de pilha direta em JS
    return function evaluate(x, y, t = 0) {
        const stack = [];
        for (let i = 0; i < rpn.length; i++) {
            const item = rpn[i];
            if (item.type === 'number') {
                stack.push(item.value);
            } else if (item.type === 'ident') {
                if (item.value === 'x') stack.push(x);
                else if (item.value === 'y') stack.push(y);
                else if (item.value === 't') stack.push(t);
                else if (CONSTANTS[item.value] !== undefined) stack.push(CONSTANTS[item.value]);
            } else if (item.type === 'op') {
                const op = item.value;
                if (op === 'u-') {
                    const val = stack.pop();
                    stack.push(-val);
                } else if (op === 'u+') {
                    // no-op
                } else {
                    const b = stack.pop();
                    const a = stack.pop();
                    const opDef = OPERATORS[op];
                    stack.push(opDef.exec(a, b));
                }
            } else if (item.type === 'fn') {
                const fn = FUNCTIONS[item.value];
                if (item.value === 'min' || item.value === 'max') {
                    const b = stack.pop();
                    const a = stack.pop();
                    stack.push(fn(a, b));
                } else {
                    const a = stack.pop();
                    stack.push(fn(a));
                }
            }
        }
        const res = stack.pop();
        return (typeof res === 'number' && !isNaN(res)) ? res : 0;
    };
}

/**
 * Compila uma string em uma função (x, y, t).
 * @param {string} exprStr
 * @returns {{ valid: boolean, fn: Function, error: string|null }}
 */
export function compileExpression(exprStr) {
    if (!exprStr || typeof exprStr !== 'string' || !exprStr.trim()) {
        return {
            valid: true,
            fn: () => 0,
            error: null
        };
    }

    try {
        const tokens = tokenize(exprStr.trim());
        const rpn = toRPN(tokens);
        const fn = compileRPN(rpn);
        // Teste preliminar em ponto neutro
        const testVal = fn(1, 1, 0);
        if (isNaN(testVal)) {
            return { valid: true, fn, error: 'Expressão resulta em valor indefinido em (1, 1)' };
        }
        return { valid: true, fn, error: null };
    } catch (err) {
        return {
            valid: false,
            fn: () => 0,
            error: err.message || 'Erro de sintaxe matemática'
        };
    }
}
