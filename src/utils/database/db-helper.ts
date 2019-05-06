import {Db, FilterQuery, UpdateQuery} from "mongodb";

const creds = require('../../../creds');

const MongoClient = require('mongodb').MongoClient;


class DbHelper {

    private db: Db;

    constructor() {
        this.initDbClinet();
    }

    async initDbClinet(): Promise<void> {
        // Connection URL
        const url = process.env.DB_URL || creds.dbUrl || 'DB URL GOES HERE';

        // Database Name
        const dbName = process.env.DB_NAME || creds.dbName || 'DB NAME GOES HERE';
        const dbClient = await MongoClient.connect(url);
        this.db = dbClient.db(dbName);
    }

    async addItemDocumentToCollection(item: FilterQuery<any>, collectionName: string): Promise<void> {
        try {
            await this.db.collection(collectionName)
                .insertOne(item);
        } catch (e) {
            console.log(e, '_________________________');
        }
    }

    async getItemFromCollection(item: FilterQuery<any>, collectionName: string): Promise<any> {
        try {
            return await this.db.collection(collectionName)
                .findOne(item);
        } catch (e) {
            console.log(e);
            return undefined;
        }

    }

    async removeFromCollection(item: FilterQuery<any>, collectionName: string): Promise<boolean> {
        try {
            await this.db.collection(collectionName)
                .findOneAndDelete(item);
            return true;
        } catch (e) {
            return false;
        }
    }

    async updateItemInCollection(searchParams: FilterQuery<any>, updatedFields: UpdateQuery<any>, collectionName: string): Promise<boolean> {
        try {
            await this.db.collection(collectionName)
                .findOneAndUpdate(searchParams, {$set: updatedFields});
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }


    async getAllItemsFromCollection(collectionName: string): Promise<Array<any>> {
        try {
            const items = await this.db.collection(collectionName)
                .find({})
                .toArray();
            return items;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

}

export default new DbHelper();
