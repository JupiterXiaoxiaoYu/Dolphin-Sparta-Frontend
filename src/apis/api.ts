import { query, ZKWasmAppRpc, LeHexBN } from "zkwasm-minirollup-rpc";

const CMD_INSTALL_PLAYER = 1n;

const CMD_BUY_DOLPHIN = 16n;
const CMD_BUY_FOOD = 17n;
const CMD_BUY_MEDICINE = 18n;
const CMD_FEED_DOLPHIN = 19n;
const CMD_HEAL_DOLPHIN = 20n;
const CMD_ATTACK_EVIL_WHALE = 21n;
const CMD_BUY_POPULATION = 22n;
const CMD_COLLECT_COINS = 23n;
const CMD_ADD_COINS = 24n;
const CMD_SELL_DOLPHIN = 25n;

function createCommand(command: bigint, nonce: bigint) {
    return (nonce << 16n) + command;
  }

export class Player {
    processingKey: string;
    rpc: ZKWasmAppRpc;

    constructor(key: string, rpc: string) {
        this.processingKey = key;
        this.rpc = new ZKWasmAppRpc(rpc);
    }

    async getState(): Promise<any> {
        let state: any = await this.rpc.queryState(this.processingKey);
        return JSON.parse(state.data);
    }

    async getNonce(): Promise<bigint> {
        let state = await this.getState();
        return BigInt(state.player.nonce);
    }

    async installPlayer() {
        let accountInfo = new LeHexBN(query(this.processingKey).pkx).toU64Array();
        try {
            let finished = await this.rpc.sendTransaction(
                new BigUint64Array([createCommand(CMD_INSTALL_PLAYER, 0n), accountInfo[1], accountInfo[2], 0n]),
                this.processingKey
            );
            console.log("Player installed at:", finished);
        } catch(e) {
            console.log("Install player error:", e);
        }
    }

    // async checkState(nonce: bigint) {
    //     try {
    //       let data = await this.getState();
    //       let nonce_after_command = data.player.nonce;
    
    //       if(nonce == BigInt(nonce_after_command)) {
    //           console.log("command works");
    //       } else {
    //           console.log("command failed. current state's nonce:", nonce_after_command);
    //       }
    //     } catch(e) {
    //       console.log("query state error:", e);
    //     }
    //   }

    async sendGameCommand(command: bigint, nonce:bigint, param: number = 0) {
        let accountInfo = new LeHexBN(query(this.processingKey).pkx).toU64Array();
        try {
            const safeParam = BigInt(Math.min(Math.max(0, param), Number.MAX_SAFE_INTEGER));
            
            let finished = await this.rpc.sendTransaction(
                new BigUint64Array([
                    createCommand(command, nonce),safeParam,
                    accountInfo[1],
                    accountInfo[2],    
                ]),
                this.processingKey
            );
            console.log(`Game command ${command} executed with param ${safeParam}`);
            return this.getState();
        } catch(e) {
            console.log("Game command error:", e);
            throw e;
        }
    }

    async buyFood() {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_BUY_FOOD, nonce);
    }

    async buyMedicine() {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_BUY_MEDICINE, nonce);
    }

    async feedDolphin(dolphinId: number) {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_FEED_DOLPHIN, nonce, Number(dolphinId));
    }

    async healDolphin(dolphinId: number) {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_HEAL_DOLPHIN, nonce, Number(dolphinId));
    }

    async attackEvilWhale() {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_ATTACK_EVIL_WHALE, nonce);
    }

    async buyPopulation() {
        let nonce = await this.getNonce();
            return this.sendGameCommand(CMD_BUY_POPULATION, nonce);
    }

    async collectCoins() {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_COLLECT_COINS, nonce);
    }

    async addCoins() {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_ADD_COINS, nonce);
    }

    async buyDolphin(dolphinType: number) {
        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_BUY_DOLPHIN, nonce, dolphinType);
    }

    async sellDolphin(dolphinIndex: number) {
        const state = await this.getState();
        const dolphinlen = state.player.data.dolphins.length;
        if (dolphinlen == 0) {
            console.log("Invalid dolphin index:", dolphinIndex);
            return;
        }

        console.log("Attempting to sell dolphin:", {
            index: dolphinIndex,
        });

        let nonce = await this.getNonce();
        return this.sendGameCommand(CMD_SELL_DOLPHIN, nonce, dolphinIndex);
    }
}

