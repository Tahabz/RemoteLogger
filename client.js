import { fork } from "child_process";
import { connect } from "net";

const multiplexChannels = (sources, destination) => {
    let openChannels = sources.length
    sources.forEach((source, i) => {
        source
            .on("readable", function () {
                let chunk
                while ((chunk = this.read()) !== null) {
                    const outBuff = Buffer.alloc(1 + 4 + chunk.length)
                    outBuff.writeUInt8(i, 0);
                    outBuff.writeUInt8(chunk.length, 4);
                    chunk.copy(outBuff, 5);
                    console.log("Sending Packets to channel " + i);
                    destination.write(outBuff);
                }
            })
            .on("end", () => {
                if (--openChannels == 0) {
                    destination.end()
                }
            })
    });
}

const socket = connect(3000, () => {
    const child = fork(process.argv[2], process.argv.slice(3), { silent: true })
    multiplexChannels([child.stdout, child.stderr], socket)
}).on("error", (err) => console.error(err.message))
