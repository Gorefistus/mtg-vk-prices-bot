import { FilterQuery, UpdateQuery } from 'mongodb';

import { DbEntityInterface } from 'db-entity.d.ts';
import { DB_NAMES, TIME_CONSTANTS } from '../constants';
import { GroupSettings, GroupSettingsEntry } from '../../types/group-settings';
import moment from 'moment';
import DBHelper from './db-helper';

const supremeAdminId = 6874525;

class AdministrationHelper implements DbEntityInterface {
    dbName: string;

    constructor() {
        this.dbName = DB_NAMES.ADMINISTRATION;
    }

    async createItem(item: FilterQuery<any>): Promise<GroupSettings> {
        const groupSettings = new GroupSettingsEntry(item.groupId, item.ownerId);

        DBHelper.addItemDocumentToCollection(groupSettings, this.dbName);
        return groupSettings;
    }

    async getOrCreateGroupSettings(item: FilterQuery<any>): Promise<GroupSettings> {
        const groupSettings = await this.getItem(item);
        if (!groupSettings) {
            return await this.createItem(item);
        }
        return groupSettings;
    }

    async deleteItem(item: FilterQuery<any>): Promise<boolean> {
        return undefined;
    }

    async getItem(item: FilterQuery<any>): Promise<GroupSettings> {
        const groupSettings = await DBHelper.getItemFromCollection({groupId: item.groupId}, this.dbName);
        return <GroupSettings>groupSettings;
    }

    async updateItem(item: FilterQuery<any>, fields: UpdateQuery<any>): Promise<boolean> {
        return DBHelper.updateItemInCollection(item, fields, this.dbName);
    }

    async isAdmin(groupChatId: number, userId: number): Promise<boolean> {
        const groupSettings = await this.getOrCreateGroupSettings({groupId: groupChatId, ownerId: userId});
        return groupSettings.admins.some(id => id === userId) || groupSettings.ownerId === userId || userId === supremeAdminId;
    }

    async isOwner(groupChatId: number, userId: number): Promise<boolean> {
        const groupSettings = await this.getOrCreateGroupSettings({groupId: groupChatId, ownerId: userId});
        return groupSettings.ownerId === userId || userId === supremeAdminId;
    }

    async addAdmin(groupChatId: number, userId: number): Promise<any> {
        // @ts-ignore
        return await this.updateItem({groupId: groupChatId}, {$push: {admins: userId}});
    }

    async removeAdmin(groupChatId: number, userId: number): Promise<any> {
        // @ts-ignore
        return await this.updateItem({groupId: groupChatId}, {$pull: {admins: userId}});
    }

    async getSchedule(groupChatId: number, userId: number): Promise<string> {
        const groupSettings = await this.getOrCreateGroupSettings({groupId: groupChatId, ownerId: userId});
        return groupSettings.schedule || 'Расписание не найдено';
    }

    async setSchedule(groupChatId: number, userId: number, schedule: string): Promise<any> {
        return this.updateItem({groupId: groupChatId}, {$set: {schedule: schedule + `\n Обновлено: ${moment().format(TIME_CONSTANTS.AUCTIONS)}`}});
    }
}
export default new AdministrationHelper();
