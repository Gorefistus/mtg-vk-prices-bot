import {PhotoAttachment} from "vk-io";

export interface ImageCache {
    photoObject: PhotoAttachment,
    cardObject: any,
    cacheDate?: number,
    trade?: boolean,
    art?: boolean,
    cardId: string,
}

export interface ImageCacheSearch {
    cardId: string,
    trade?: boolean,
    art?: boolean,
}


export interface VkPhotoObject {
    id: number,
    album_id: number,
    owner_id: number,
    user_id: number,
    sizes: Array<any>
    text: string,
    date: number,
    access_key: string
}
