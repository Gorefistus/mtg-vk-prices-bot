const creds = require('../../../creds');

const MongoClient = require('mongodb').MongoClient;


class DBHelper {


    constructor() {
        this.initDbClinet();
    }

    async initDbClinet() {
        // Connection URL
        const url = process.env.DB_URL || creds.dbUrl || 'DB URL GOES HERE';

        // Database Name
        const dbName = process.env.DB_NAME || creds.dbName || 'DB NAME GOES HERE';
        const dbClient = await MongoClient.connect(url);
        this.db = dbClient.db(dbName);
    }

    async addItemDocumentToCollection(item, collectionName) {
        try {
            await this.db.collection(collectionName)
                .insertOne(item);
        } catch (e) {
            console.log(e);
        }
    }

    async getItemFromCollection(item, collectionName) {
        try {
            return await this.db.collection(collectionName)
                .findOne(item);
        } catch (e) {
            console.log(e);
            return undefined;
        }

    }

    async removeFromCollection(item, collectionName) {
        try {
            await this.db.collection(collectionName)
                .findOneAndDelete(item);
            return true;
        } catch (e) {
            return false;
        }
    }

    async updateItemInCollection(searchParams, updatedFields, collectionName) {
        try {
            await this.db.collection(collectionName)
                .findOneAndUpdate(searchParams, { $set: updatedFields });
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }


    async getAllItemsFromCollection(collectionName) {
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


module.exports = new DBHelper();
