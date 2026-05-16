import { Parser } from 'expr-eval';

export const mathParser = new Parser();

mathParser.functions.nrt = function (x: number, n: number) {
	return Math.pow(x, 1 / n);
};
