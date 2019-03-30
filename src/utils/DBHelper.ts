const creds = require('../../../creds');

import mongo, { Db } from 'mongodb';


export default class DBHelper {

     database: Db;

    async initDbClient(){
        this.database = await mongo.MongoClient.connect('url');
    }
}
