export interface ISpriteState {
    spriteLine?: number;
    frameMax?: number;
    start?: number;
    end?: number;
}

export interface ISpriteConfig {
    name: string;
    width?: number;
    height?: number;
    frameSize?: number;
    highestFrameMax?: number;
    totalSpriteLine?: number;
    imageSrc: string;
    states: {
        [key: string]: ISpriteState;
    };
}

export enum SpriteType {
    DEFAULT = 'default',
    CUSTOM = 'custom',
}

/*
 *  If "framesize" has been specify in the config, we don't have to include these object {
 *      width, height, highestFrameMax, totalSpriteLine 
 *  }
 */
export interface ISpriteConfig {
    name: string,
    credit?: {
        // link to download
        resource?: string,
        // link to post, etc
        link?: string,
        // link or string of name to social media
        socialMedia?: string,
    },
    id?: string,
    width?: number,
    height?: number,
    frameSize?: number,
    highestFrameMax?: number,
    totalSpriteLine?: number,
    type?: SpriteType,
    customId?: string,
    imageSrc: string,
    states: {
        [key: string]: ISpriteState;
    },
    frames: number,
}

export interface IPetObject {
    frameSize: number;
    imageSrc: string;
    name: string;
    states: {
        [key: string]: {
            start: number;
            end: number;
        };
    };
    customId?: string;
}