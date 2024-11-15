import axios from 'axios';
import { sign, query } from "./sign.js";
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export class ZKWasmAppRpc {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.instance = axios.create({
            baseURL: this.baseUrl,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    async sendRawTransaction(cmd, prikey) {
        try {
            const data = sign(cmd, prikey);
            const response = await this.instance.post("/send", JSON.stringify(data));
            if (response.status === 201) {
                const jsonResponse = response.data;
                return jsonResponse;
            }
            else {
                throw "SendTransactionError";
            }
        }
        catch (error) {
            console.error('Error:', error);
            throw "SendTransactionError " + error;
        }
    }
    async sendTransaction(cmd, prikey) {
        try {
            let resp = await this.sendRawTransaction(cmd, prikey);
            for (let i = 0; i < 5; i++) { //detect job status with 1 sec delay
                await delay(1000);
                let jobStatus;
                try {
                    jobStatus = await this.queryJobStatus(resp.jobid);
                    if (jobStatus.finishedOn == undefined) {
                        throw Error("WaitingForProcess");
                    }
                }
                catch (e) {
                    continue;
                }
                if (jobStatus) {
                    if (jobStatus.finishedOn != undefined && jobStatus.failedReason == undefined) {
                        return jobStatus.returnvalue;
                    }
                    else {
                        throw Error(jobStatus.failedReason);
                    }
                }
            }
            throw Error("MonitorTransactionFail");
        }
        catch (e) {
            //console.log(e);
            throw e;
        }
    }
    async queryState(prikey) {
        try {
            const data = query(prikey);
            const response = await this.instance.post("/query", JSON.stringify(data));
            if (response.status === 201) {
                const jsonResponse = response.data;
                return jsonResponse;
            }
            else {
                throw "UnexpectedResponseStatus";
            }
        }
        catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 500) {
                    throw "QueryStateError";
                }
                else {
                    throw "UnknownError";
                }
            }
            else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                throw 'No response was received from the server, please check your network connection.';
            }
            else {
                throw "UnknownError";
            }
        }
    }
    async query_config() {
        try {
            const response = await this.instance("/config", {
                method: 'POST'
            });
            if (response.status === 201) {
                const jsonResponse = response.data;
                return jsonResponse;
            }
            else {
                throw "QueryConfigError";
            }
        }
        catch (error) {
            throw "QueryStateError " + error;
        }
    }
    async queryJobStatus(jobId) {
        try {
            const url = `/job/${jobId}`;
            const response = await this.instance(url, {
                method: 'GET',
            });
            if (response.status === 201) {
                const jsonResponse = response.data;
                return jsonResponse;
            }
            else {
                throw "QueryJobError";
            }
        }
        catch (error) {
            throw "QueryJobError " + error;
        }
    }
}
//# sourceMappingURL=rpc.js.map