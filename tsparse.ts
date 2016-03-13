#!/usr/bin/env node

import {ArgumentParser} from 'argparse';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

let parser = new ArgumentParser({
    addHelp: true,
});
parser.addArgument(['infile'], {
    help: 'input file',
});
let args = parser.parseArgs();

let sourceText = fs.readFileSync(args.infile, 'utf8');
let sf = ts.createSourceFile(args.infile, sourceText, ts.ScriptTarget.ES5, true);

export interface Span {
    kind: string;
    fullStart: number;
    start: number;
    end: number;
    children?: Span[];
}

function gatherSpans(node: ts.Node): Span {
    let children: Span[] = [];
    ts.forEachChild(node, (n) => { children.push(gatherSpans(n)); });
    if (children.length == 0) {
        children = undefined;
    }
    return {
        kind: ts.SyntaxKind[node.kind],
        fullStart: node.getFullStart(),
        start: node.getStart(),
        end: node.getEnd(),
        children,
    };
}

function readDataFile(name: string): string {
    return fs.readFileSync(path.join(__dirname, name), 'utf8');
}

export interface Data {
    sourceText: string;
    spans: Span,
}
let data: Data = {
    sourceText,
    spans: gatherSpans(sf),
};

console.log(readDataFile('vis.html'));
console.log(`<style>${readDataFile('style.css')}</style>`);
console.log('<script>');
console.log('(function(data) {');
console.log(readDataFile('tsvis.js'));
let json = JSON.stringify(data, null, '\t').replace(/<\/script/g, '&lt;/script');
console.log(`})(${json});\n`);
console.log('</script>')
