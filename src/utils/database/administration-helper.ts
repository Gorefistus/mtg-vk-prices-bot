import {FilterQuery, UpdateQuery} from "mongodb";

import {DbEntityInterface} from "db-entity.d.ts";
import {DB_NAMES} from "../constants";
import {GroupSettings, GroupSettingsEntry} from "../../types/group-settings";
import DBHelper from "./db-helper";


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

    async deleteItem(item: FilterQuery<any>): Promise<boolean> {
        return undefined;
    }

    async getItem(item: FilterQuery<any>): Promise<GroupSettings> {
        const groupSettings = await DBHelper.getItemFromCollection({groupId: item.groupId}, this.dbName);
        return <GroupSettings>groupSettings;
    }

    async updateItem(item: FilterQuery<any>, fields: UpdateQuery<any>): Promise<boolean> {
        return undefined;
    }


}

export default new AdministrationHelper();
