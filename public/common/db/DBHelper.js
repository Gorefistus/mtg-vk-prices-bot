const MongoClient = require('mongodb').MongoClient;


class DBHelper {


    constructor() {
        this.initDbClinet();
    }

    async initDbClinet() {
        // Connection URL
        const url = process.env.DB_URL || 'mongodb://bot:Qweasd123@ds047146.mlab.com:47146/heroku_wvf8h01b';

        // Database Name
        const dbName = process.env.DB_NAME || 'heroku_wvf8h01b';
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

}


module.exports = new DBHelper();
