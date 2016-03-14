import {Span, ParsedFile} from './tsparse';

declare const data: ParsedFile;

let codeDom = document.getElementById('code');
codeDom.innerText = data.sourceText;
function highlight(span: Span) {
    codeDom.innerText = data.sourceText.substr(0, span.fullStart);
    if (span.fullStart < span.start) {
        let dom = document.createElement('span');
        dom.className = 'trivia';
        dom.innerText = data.sourceText.substr(span.fullStart, span.start - span.fullStart);
        codeDom.appendChild(dom);
    }
    if (span.start < span.end) {
        let dom = document.createElement('span');
        dom.className = 'inner';
        dom.innerText = data.sourceText.substr(span.start, span.end - span.start);
        codeDom.appendChild(dom);
    }
    if (span.end < data.sourceText.length) {
        let text = document.createTextNode(data.sourceText.substr(span.end, data.sourceText.length - span.end));
        codeDom.appendChild(text);
    }
}

let dom = document.getElementById('tree');
function visit(span: Span, indent: number = 0) {
    let div = document.createElement('div');
    div.innerText = span.kind;
    div.style.paddingLeft = (indent * 2) + 'ex';
    div.onmouseover = () => highlight(span);
    dom.appendChild(div);
    if (span.children) {
        for (let child of span.children) {
            visit(child, indent+1);
        }
    }
}
visit(data.spans);
