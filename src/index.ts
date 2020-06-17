import { Socket, createSocket } from 'dgram';
import { 
    cpu as getCpuInfo,
    system as getSystemInfo,
    bios as getBiosInfo,
    baseboard as getBaseboardInfo,
    chassis as getChassisInfo
} from 'systeminformation';

export default class UdpConnector {
    static PORT: number = 41234;
    static socket: Socket;
    static systemInfo: object;
    static responseMessage: Buffer;

    static async GenerateSystemInfo() {
        const cpu = await getCpuInfo();
        const system = await getSystemInfo();
        const bios = await getBiosInfo();
        const baseboard = await getBaseboardInfo();
        const chassis = await getChassisInfo();
        return {
            cpu,
            system,
            bios,
            baseboard,
            chassis,
        }
    }

    static GenerateResponseMessage() {
        return Buffer.from(JSON.stringify({
            type: 'DEVICES_DISCOVERY_RESPONSE',
            data: this.systemInfo
        }));
    }
    
    static async StartSocket() {
        if (!this.socket) {
            this.systemInfo = await this.GenerateSystemInfo();
            this.responseMessage =  this.GenerateResponseMessage();
            this.socket = createSocket('udp4');

            this.socket.on('message', (msg, rinfo) => {
                console.log(`UPD packet got: ${msg} from ${rinfo.address}:${rinfo.port}`);

                this.socket.send(this.responseMessage, 0, this.responseMessage.length, rinfo.port, rinfo.address);
            });

            this.socket.on('listening', () => {
                this.socket.setBroadcast(true);
                console.log(`UDP server listening on port ${this.PORT}`);
            });

            this.socket.bind(this.PORT);
        }

        return this.socket;
    }
}

process.on('SIGINT', () => {
    process.exit();
});

(async function () {
    await UdpConnector.StartSocket();
})();
