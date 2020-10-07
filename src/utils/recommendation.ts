import { Keyboard, IKeyboardProxyButton } from 'vk-io';
import { ColorIndexes, COMMAND_IDS } from './constants';
import { KEYBOARD } from './strings';

export function getRecommendation(request: string, type: string, doNotShow = false): Keyboard {
    if (doNotShow) {
        return undefined;
    }
    
    const keyboardRow = <Array<IKeyboardProxyButton>>[];

    Object.keys(COMMAND_IDS).filter(command => command !== type).forEach((command, index) => {
        keyboardRow.push(Keyboard.textButton({
            // @ts-ignore
            label: KEYBOARD[command],
            payload: {command: `!${command} ${request}`},
            // @ts-ignore
            color: ColorIndexes[index]
        }));
    });


    return Keyboard.keyboard([[keyboardRow[0], keyboardRow[1]], [keyboardRow[2], keyboardRow[3]]]).inline(true);
}
