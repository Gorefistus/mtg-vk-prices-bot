import { LANGS, LANGS_SCRY } from './constants';
import { LANGUAGES } from './strings';

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


export function getLanguageByLangCode(langCode: string): string {
    switch (langCode) {
        case LANGS.LANG_DE:
            return LANGUAGES.LANG_DE;
        case LANGS_SCRY.LANG_RUS_SCRY:
            return LANGUAGES.LANG_RUS;
        case LANGS_SCRY.LANG_ENG_SCRY:
            return LANGUAGES.LANG_ENG;
        case LANGS.LANG_ESP:
            return LANGUAGES.LANG_ESP;
        case LANGS.LANG_FR:
            return LANGUAGES.LANG_FR;
        case LANGS.LANG_IT:
            return LANGUAGES.LANG_IT;
        case LANGS.LANG_PT:
            return LANGUAGES.LANG_PT;
        case LANGS.LANG_JA:
            return LANGUAGES.LANG_JA;
        case LANGS.LANG_KO:
            return LANGUAGES.LANG_KO;
        case LANGS.LANG_ZHT:
            return LANGUAGES.LANG_ZHT;
        case LANGS.LANG_ZHS:
            return LANGUAGES.LANG_ZHS;
        case LANGS.LANG_HE:
            return LANGUAGES.LANG_HE;
        case LANGS.LANG_LA:
            return LANGUAGES.LANG_LA;
        case LANGS.LANG_GRC:
            return LANGUAGES.LANG_GRC;
        case LANGS.LANG_AR:
            return LANGUAGES.LANG_AR;
        case LANGS.LANG_SA:
            return LANGUAGES.LANG_SA;
        case LANGS.LANG_PX:
            return LANGUAGES.LANG_PX;
        default:
            return LANGUAGES.LANG_ENG;
    }
}
