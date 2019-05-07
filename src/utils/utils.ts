export function escapeRegExp(str: string): string {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

export function replaceAll(str: string, find: string, replace: string): string {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export function removeAllSymbols(str: string, arrSymbolsToRemove: Array<string>): string {
    let finalStr = str;
    if (str && arrSymbolsToRemove && Array.isArray(arrSymbolsToRemove)) {
        arrSymbolsToRemove.forEach((symbol) => {
            finalStr = replaceAll(finalStr, symbol, '');
        });
    }
    return finalStr;
}

