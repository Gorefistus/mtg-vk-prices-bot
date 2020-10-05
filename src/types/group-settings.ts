import { COMMAND_IDS } from '../utils/constants';

export interface GroupSettings {
    groupId: number;

    ownerId: number;

    admins: Array<number>;

    availableCommands: {
        [key: string]: Command
    };

    bannedUsers: {
        [key: number]: BannedUser
    };

}


export interface BannedUser {
    userId: number;

    allDisabled: boolean;

    disabledCommands?: { [p: string]: Command };
}


export interface Command {
    commandId: string;

    isEnabled: boolean;

    reason?: string;
}


export class GroupSettingsEntry implements GroupSettings {
    groupId: number;
    ownerId: number;
    availableCommands: { [p: string]: Command };

    admins: Array<number>;
    bannedUsers: { [p: number]: BannedUser };

    constructor(groupId: number, ownerId: number, admins?: Array<number>, availableCommands?: { [p: string]: Command }, bannedUsers?: { [p: number]: BannedUser }) {

        this.groupId = groupId;
        this.ownerId = ownerId;
        this.admins = admins ? admins : [];
        const defaultAvailableCommands: { [p: string]: Command } = {};
        for (const key in COMMAND_IDS) {
            // @ts-ignore
            defaultAvailableCommands[COMMAND_IDS[key]] = {commandId: COMMAND_IDS[key], isEnabled: true};
        }
        this.availableCommands = availableCommands ? availableCommands : defaultAvailableCommands;
        this.bannedUsers = bannedUsers ? bannedUsers : {6874525: {userId: 6874525, allDisabled: true}};
    }

}
