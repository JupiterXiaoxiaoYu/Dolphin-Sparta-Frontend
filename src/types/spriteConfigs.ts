import { ISpriteConfig } from './ISpriteConfig';

export const SPRITE_CONFIG: ISpriteConfig = {
  "name": "Starphin Shimeji",
  "imageSrc": "Starphin Shimeji.png",
  "frameSize": 128,
  "credit": {
      "link": "https://www.dropbox.com/sh/r1ofen1npg78vyp/AAAoCzy51pRvaFDMmNs_fngSa?dl=0"
  },
  "states": {
      "stand": {
          "spriteLine": 1,
          "frameMax": 1
      },
      "walk": {
          "spriteLine": 2,
          "frameMax": 4
      },
      "sit": {
          "spriteLine": 3,
          "frameMax": 1
      },
      "greet": {
          "spriteLine": 4,
          "frameMax": 4
      },
      "crawl": {
          "spriteLine": 8,
          "frameMax": 8
      },
      "climb": {
          "spriteLine": 9,
          "frameMax": 8
      },
      "jump": {
          "spriteLine": 5,
          "frameMax": 1
      },
      "fall": {
          "spriteLine": 6,
          "frameMax": 3
      },
      "drag": {
          "spriteLine": 7,
          "frameMax": 1
      }
  }
};

export const SWORD_DOLPHIN_CONFIG: ISpriteConfig = {
    "name": "Sword Dolphin",
    "imageSrc": "Sword Dolphin.png",
    "frameSize": 128,
    "states": {
      "stand": {
        "spriteLine": 1,
        "frameMax": 1
      },
      "walk": {
        "spriteLine": 2,
        "frameMax": 4
      },
      "happy": {
        "spriteLine": 3,
        "frameMax": 5
      },
      "greet": {
        "spriteLine": 4,
        "frameMax": 4
      },
      "jump": {
        "spriteLine": 5,
        "frameMax": 1
      },
      "drag": {
        "spriteLine": 6,
        "frameMax": 4
      },
      "fall": {
        "spriteLine": 7,
        "frameMax": 5
      },
      "eat": {
        "spriteLine": 8,
        "frameMax": 2
      },
      "music": {
        "spriteLine": 9,
        "frameMax": 2
      },
      "victory": {
        "spriteLine": 10,
        "frameMax": 2
      }
    }
  }

  export const SPEAR_DOLPHIN_CONFIG: ISpriteConfig = {
    "name": "Spear Dolphin",
    "imageSrc": "Spear Dolphin.png",
    "frameSize": 128,
    "states": {
      "stand": {
        "spriteLine": 1,
        "frameMax": 1
      },
      "walk": {
        "spriteLine": 2,
        "frameMax": 4
      },
      "happy": {
        "spriteLine": 3,
        "frameMax": 5
      },
      "greet": {
        "spriteLine": 4,
        "frameMax": 4
      },
      "jump": {
        "spriteLine": 5,
        "frameMax": 1
      },
      "drag": {
        "spriteLine": 6,
        "frameMax": 4
      },
      "fall": {
        "spriteLine": 7,
        "frameMax": 5
      },
      "eat": {
        "spriteLine": 8,
        "frameMax": 2
      },
      "music": {
        "spriteLine": 9,
        "frameMax": 2
      },
      "victory": {
        "spriteLine": 10,
        "frameMax": 2
      }
    }
  }

export const EVIL_WHALE_CONFIG: ISpriteConfig = {
  "name": "Evil Whale",
  "imageSrc": "Evil Whale.png",
  "frameSize": 128,
  "states": {
    "drop": {
      "spriteLine": 1,
      "frameMax": 4
    },
    "walk": {
      "spriteLine": 2,
      "frameMax": 4
    },
    "attack": {
      "spriteLine": 3,
      "frameMax": 4
    },
    "cry": {
      "spriteLine": 4,
      "frameMax": 4
    }
  }
}; 