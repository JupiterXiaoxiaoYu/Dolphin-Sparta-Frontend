import { ZkWasmUtil, ProofSubmitMode, ZkWasmServiceHelper, InputContextType, } from "zkwasm-service-helper";
import { get_user_private_account, endpoint, get_image_md5, get_user_addr, } from "./config.js";
export async function submitRawProof(pub_inputs, priv_inputs, txdata) {
    const helper = new ZkWasmServiceHelper(endpoint, "", "");
    let proofSubmitMode = ProofSubmitMode.Manual; // Auto
    //let proofSubmitMode = ProofSubmitMode.Auto;
    let info = {
        user_address: get_user_addr().toLowerCase(),
        md5: get_image_md5(),
        public_inputs: pub_inputs,
        private_inputs: priv_inputs,
        proof_submit_mode: proofSubmitMode, // default is manual
        //input_context_type: InputContextType.Custom// default is image current
    };
    let tc = InputContextType.Custom;
    ZkWasmUtil.validateContextBytes(txdata);
    let bytesFile = await ZkWasmUtil.bytesToTempFile(txdata);
    let info_context = { ...info,
        input_context: bytesFile,
        input_context_md5: ZkWasmUtil.convertToMd5(txdata),
        input_context_type: tc,
    };
    let msgString = ZkWasmUtil.createProvingSignMessage(info_context);
    let signature;
    try {
        signature = await ZkWasmUtil.signMessage(msgString, get_user_private_account());
    }
    catch (e) {
        console.log("error signing message", e);
        throw "Signing proving message failesd";
    }
    let task = {
        ...info_context,
        signature: signature,
    };
    let response = await helper.addProvingTask(task);
    return response.id;
    //console.log("response is ", response);
}
export async function submitProof(merkle, txs, txdata) {
    const helper = new ZkWasmServiceHelper(endpoint, "", "");
    const pub_inputs = [merkle[0], merkle[1], merkle[2], merkle[3]].map((x) => { return `${x}:i64`; });
    const priv_inputs = [];
    priv_inputs.push(`${txs.length}:i64`);
    for (const tx of txs) {
        priv_inputs.push(`0x${tx.msg}:bytes-packed`);
        priv_inputs.push(`0x${tx.pkx}:bytes-packed`);
        priv_inputs.push(`0x${tx.pky}:bytes-packed`);
        priv_inputs.push(`0x${tx.sigx}:bytes-packed`);
        priv_inputs.push(`0x${tx.sigy}:bytes-packed`);
        priv_inputs.push(`0x${tx.sigr}:bytes-packed`);
    }
    ;
    //console.log(priv_inputs);
    let proofSubmitMode = ProofSubmitMode.Manual; // Auto
    //let proofSubmitMode = ProofSubmitMode.Auto;
    let info = {
        user_address: get_user_addr().toLowerCase(),
        md5: get_image_md5(),
        public_inputs: pub_inputs,
        private_inputs: priv_inputs,
        proof_submit_mode: proofSubmitMode, // default is manual
        //input_context_type: InputContextType.Custom// default is image current
    };
    let tc = InputContextType.Custom;
    ZkWasmUtil.validateContextBytes(txdata);
    let bytesFile = await ZkWasmUtil.bytesToTempFile(txdata);
    let info_context = { ...info,
        input_context: bytesFile,
        input_context_md5: ZkWasmUtil.convertToMd5(txdata),
        input_context_type: tc,
    };
    let msgString = ZkWasmUtil.createProvingSignMessage(info_context);
    let signature;
    try {
        signature = await ZkWasmUtil.signMessage(msgString, get_user_private_account());
    }
    catch (e) {
        console.log("error signing message", e);
        throw "Signing proving message failesd";
    }
    let task = {
        ...info_context,
        signature: signature,
    };
    let response = await helper.addProvingTask(task);
    return response.id;
    //console.log("response is ", response);
}
function timeout(promise, ms) {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout exceeded")), ms));
    return Promise.race([promise, timeoutPromise]);
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function submitProofWithRetry(merkle, txs, txdata) {
    for (let i = 0; i < 20; i++) {
        try {
            let response = await timeout(submitProof(merkle, txs, txdata), 10000);
            return response;
        }
        catch (e) {
            console.log("submit proof error:", e);
            console.log("retrying ...");
            wait(30000);
            continue;
        }
    }
    console.log("can not generating proof ...");
    process.exit(1);
}
export async function get_latest_proof() {
    const helper = new ZkWasmServiceHelper(endpoint, "", "");
    let query = {
        md5: get_image_md5(),
        user_address: null,
        id: null,
        tasktype: "Prove",
        taskstatus: "Done",
        total: 1,
    };
    let tasks = await helper.loadTasks(query);
    if (tasks.data.length == 0) {
        return null;
    }
    else {
        return tasks.data[0];
    }
}
export async function has_uncomplete_task() {
    const helper = new ZkWasmServiceHelper(endpoint, "", "");
    let query = {
        md5: get_image_md5(),
        user_address: null,
        id: null,
        tasktype: "Prove",
        taskstatus: "Pending",
        total: 1,
    };
    let tasks = await helper.loadTaskList(query);
    // If no Pending tasks, check for Processing tasks
    if (tasks.data.length === 0) {
        query.taskstatus = "Processing";
        tasks = await helper.loadTaskList(query);
    }
    // Return true if there are any uncompleted tasks, false otherwise
    return tasks.data.length > 0;
}
//# sourceMappingURL=prover.js.map