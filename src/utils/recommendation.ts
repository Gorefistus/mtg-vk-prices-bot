import { Keyboard, TextButton } from 'vk-io';
import { ColorIndexes, COMMAND_IDS } from './constants';
import { KEYBOARD } from './strings';

export function getRecommendation(request: string, type: string, isPrivate = false): Keyboard {
    if (!request || request.length === 0 || !isPrivate) {
        return undefined;
    }

    const keyboardRow = <Array<TextButton>>[];


    Object.keys(COMMAND_IDS).filter(command => command !== type).forEach((command, index) => {
        keyboardRow.push(Keyboard.textButton({
            // @ts-ignore
            label: KEYBOARD[command],
            payload: {command: `!n${command} ${request}`},
            color: ColorIndexes[index]
        }));
    });


    return Keyboard.keyboard([[keyboardRow[0], keyboardRow[1]], [keyboardRow[2], keyboardRow[3]]], {oneTime: true});
}
