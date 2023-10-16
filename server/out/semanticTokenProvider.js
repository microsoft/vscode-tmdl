"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTextToken = exports.parseText = exports.encodeTokenModifiers = exports.encodeTokenType = exports.tokenModifiersLegend = exports.tokenTypesLegend = void 0;
const tokenTypes = new Map();
const tokenModifiers = new Map();
exports.tokenTypesLegend = [
    'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
    'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
    'method', 'decorator', 'macro', 'variable', 'parameter', 'property', 'label'
];
exports.tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));
exports.tokenModifiersLegend = [
    'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
    'modification', 'async'
];
exports.tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));
function encodeTokenType(tokenType) {
    if (tokenTypes.has(tokenType)) {
        return tokenTypes.get(tokenType);
    }
    else if (tokenType === 'notInLegend') {
        return tokenTypes.size + 2;
    }
    return 0;
}
exports.encodeTokenType = encodeTokenType;
function encodeTokenModifiers(strTokenModifiers) {
    let result = 0;
    for (let i = 0; i < strTokenModifiers.length; i++) {
        const tokenModifier = strTokenModifiers[i];
        if (tokenModifiers.has(tokenModifier)) {
            result = result | (1 << tokenModifiers.get(tokenModifier));
        }
        else if (tokenModifier === 'notInLegend') {
            result = result | (1 << tokenModifiers.size + 2);
        }
    }
    return result;
}
exports.encodeTokenModifiers = encodeTokenModifiers;
function parseText(text) {
    const r = [];
    const lines = text.split(/\r\n|\r|\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let currentOffset = 0;
        do {
            const openOffset = line.indexOf('[', currentOffset);
            if (openOffset === -1) {
                break;
            }
            const closeOffset = line.indexOf(']', openOffset);
            if (closeOffset === -1) {
                break;
            }
            const tokenData = parseTextToken(line.substring(openOffset + 1, closeOffset));
            r.push({
                line: i,
                startCharacter: openOffset + 1,
                length: closeOffset - openOffset - 1,
                tokenType: tokenData.tokenType,
                tokenModifiers: tokenData.tokenModifiers
            });
            currentOffset = closeOffset;
        } while (true);
    }
    return r;
}
exports.parseText = parseText;
function parseTextToken(text) {
    const parts = text.split('.');
    return {
        tokenType: parts[0],
        tokenModifiers: parts.slice(1)
    };
}
exports.parseTextToken = parseTextToken;
//# sourceMappingURL=semanticTokenProvider.js.map