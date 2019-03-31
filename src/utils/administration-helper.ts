import {FilterQuery, UpdateQuery} from "mongodb";

import {DbEntityInterface} from "db-entity.ts";
import {DB_NAMES} from "./constants";
import {GroupSettings, GroupSettingsEntry} from "../types/group-settings";
import DBHelper from "./db-helper";


class AdministrationHelper implements DbEntityInterface {
    dbName: string;

    constructor() {
        this.dbName = DB_NAMES.ADMINISTRATION;
    }

    async createItem(item: FilterQuery<any>): Promise<GroupSettings> {
        const groupSettings = new GroupSettingsEntry(item.id);

        DBHelper.addItemDocumentToCollection(groupSettings, this.dbName);
        return groupSettings;
    }

    async deleteItem(item: FilterQuery<any>): Promise<boolean> {
        return undefined;
    }

    async getItem(item: FilterQuery<any>): Promise<GroupSettings> {
        const groupSettings = await DBHelper.getItemFromCollection({id: item.id}, this.dbName);
        return <GroupSettings>groupSettings;
    }

    async updateItem(item: UpdateQuery<any>): Promise<boolean> {
        return undefined;
    }


}

export default new AdministrationHelper();
