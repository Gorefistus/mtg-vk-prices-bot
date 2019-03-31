export interface GroupSettings {
    id: string;

    admins: Array<string>;

    availableCommands: Array<Command>;

    bannedUsers: Array<BannedUser>

}


export interface BannedUser {
    userId: string;

    allDisabled: boolean;

    disabledCommands: Array<Command>
}


export interface Command {
    commandId: string;

    isEnabled: boolean;

    reason?: string;
}


export class GroupSettingsEntry implements GroupSettings {
    id: string;

    admins: Array<string>;
    availableCommands: Array<Command>;
    bannedUsers: Array<BannedUser>;

    constructor(id: string, admins?: Array<string>, availableCommands?: Array<Command>, bannedUsers?: Array<BannedUser>) {
        this.id = id;
        this.admins = admins ? admins : [];
        this.availableCommands = availableCommands ? availableCommands : [];
        this.bannedUsers = bannedUsers ? bannedUsers : [];
    }

}
