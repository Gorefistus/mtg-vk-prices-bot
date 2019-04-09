import {FilterQuery, UpdateQuery} from "mongodb";

export interface DbEntityInterface {
    dbName: string,

    createItem(item: FilterQuery<any>): Promise<any>

    getItem(item: FilterQuery<any>): Promise<any>

    updateItem(item: UpdateQuery<any>): Promise<boolean>

    deleteItem(item: FilterQuery<any>): Promise<boolean>

    validateCacheEntry?(date: number): boolean,

}
