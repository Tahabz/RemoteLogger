import { createWriteStream } from 'fs';
import { createServer } from 'net'

const demultiplexChannel = (source, destinations) => {
    source.on("readable", () => {
        let currentChannel = source.read(1)?.readUInt8();
        let chunkLength = source.read(4)?.readUInt32BE();
        let chunk = source.read(chunkLength)
        if (!chunk)
            return null
        console.log(`Received packet from: ${currentChannel}`)
        destinations[currentChannel].write(chunk)
    }).on("end", () => {
        destinations.forEach(dest => {
            dest.end()
        });
        console.log("Source Channel Closed")
    })
}


createServer((socket) => {
    const stdoutStream = createWriteStream('stdout.log', { flags: 'a' })
    const stderrStream = createWriteStream('stderr.log', { flags: 'a' })
    demultiplexChannel(socket, [stdoutStream, stderrStream])
}).listen(3000, () => console.log("Server Started"))