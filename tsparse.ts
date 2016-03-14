#!/usr/bin/env node

import {ArgumentParser} from 'argparse';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export interface Span {
    kind: string;
    fullStart: number;
    start: number;
    end: number;
    children?: Span[];
}

export interface ParsedFile {
    sourceText: string;
    spans: Span,
}

let parser = new ArgumentParser({
    addHelp: true,
});
parser.addArgument(['-o', '--out'], {
    help: 'output path',
});
parser.addArgument(['infile'], {
    help: 'input file',
});
let args = parser.parseArgs();

let outfile = process.stdout;
if (args.out) {
    outfile = fs.createWriteStream(args.out);
}
let sourceText = fs.readFileSync(args.infile, 'utf8');
let sf = ts.createSourceFile(args.infile, sourceText, ts.ScriptTarget.ES5, true);

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

let data: ParsedFile = {
    sourceText,
    spans: gatherSpans(sf),
};

outfile.write(readDataFile('vis.html'));
outfile.write(`<style>${readDataFile('style.css')}</style>`);
outfile.write('<script>');
outfile.write('(function(data) {');
outfile.write(readDataFile('tsvis.js'));
let json = JSON.stringify(data).replace(/<\/script/g, '&lt;/script');
outfile.write(`})(${json});\n`);
outfile.write('</script>')
if (outfile !== process.stdout) {
    outfile.end();
}
