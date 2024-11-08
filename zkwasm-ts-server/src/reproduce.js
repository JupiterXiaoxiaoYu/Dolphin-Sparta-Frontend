import { ServiceHelper } from "./config.js";
import * as fs from 'fs';
async function getTask(taskid) {
    const queryParams = {
        id: taskid,
        tasktype: "Prove",
        taskstatus: null,
        user_address: null,
        md5: null,
        total: 1,
    };
    const response = await ServiceHelper.loadTasks(queryParams);
    return response.data[0];
}
async function replay(taskId) {
    const data0 = await getTask(taskId);
    const public_inputs = data0.public_inputs;
    const private_inputs = data0.private_inputs;
    fs.writeFileSync('run-image.sh', `CLI=$HOME/zkWasm/target/release/zkwasm-cli\n`);
    fs.appendFileSync('run-image.sh', `PARAMS=$HOME/zkWasm/params\n`);
    fs.appendFileSync('run-image.sh', `IMAGE=image.wasm\n`);
    fs.appendFileSync('run-image.sh', `OUTPUT=output\n`);
    fs.appendFileSync('run-image.sh', `$CLI --params $PARAMS test dry-run --wasm $IMAGE \\\n`, 'utf-8');
    for (const p of public_inputs) {
        fs.appendFileSync('run-image.sh', `--public ${p} \\\n`, 'utf-8');
    }
    for (const p of private_inputs) {
        fs.appendFileSync('run-image.sh', `--private ${p} \\\n`, 'utf-8');
    }
    fs.appendFileSync('run-image.sh', `--output $OUTPUT`, 'utf-8');
}
replay("66ee9d79d988d3dbdfd2b891");
//# sourceMappingURL=reproduce.js.map