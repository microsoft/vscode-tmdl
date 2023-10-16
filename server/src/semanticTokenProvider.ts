

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

export const tokenTypesLegend = [
	'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
	'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
	'method', 'decorator', 'macro', 'variable', 'parameter', 'property', 'label'
];
tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

export const tokenModifiersLegend = [
	'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
	'modification', 'async'
];
tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

export function encodeTokenType(tokenType: string): number {
    if (tokenTypes.has(tokenType)) {
        return tokenTypes.get(tokenType)!;
    } else if (tokenType === 'notInLegend') {
        return tokenTypes.size + 2;
    }
    return 0;
}

export function encodeTokenModifiers(strTokenModifiers: string[]): number {
    let result = 0;
    for (let i = 0; i < strTokenModifiers.length; i++) {
        const tokenModifier = strTokenModifiers[i];
        if (tokenModifiers.has(tokenModifier)) {
            result = result | (1 << tokenModifiers.get(tokenModifier)!);
        } else if (tokenModifier === 'notInLegend') {
            result = result | (1 << tokenModifiers.size + 2);
        }
    }
    return result;
}

export function parseText(text: string): IParsedToken[] {
    const r: IParsedToken[] = [];
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

export function parseTextToken(text: string): { tokenType: string; tokenModifiers: string[]; } {
    const parts = text.split('.');
    return {
        tokenType: parts[0],
        tokenModifiers: parts.slice(1)
    };
}