import { execSync } from 'child_process';
import { Socket, createSocket } from 'dgram';
import { platform, release, type, version, arch, hostname, cpus, networkInterfaces } from 'os';

export default class UdpConnector {
    static PORT: number = 41234;
    static socket: Socket;
    static systemInfo: object;
    static responseMessage: Buffer;

    static getVersion() {
        if (platform() === 'linux') {
            const releaseInfo = execSync('cat /etc/os-release').toString();
            const releaseInfoLines = releaseInfo.split('\n');

            let version = '';
            releaseInfoLines.forEach((line) => {
                const parts = line.replace(/"/g,'').split('=');
                if (parts[0] === 'PRETTY_NAME') {
                    version = parts[1];
                }
            });

            return version;
        } else {
            return version();
        }
    }

    static async GenerateSystemInfo() {
        return {
            platform: platform(),
            release: release(),
            type: type(),
            version: this.getVersion(),
            arch: arch(),
            hostname: hostname(),
            cpus: cpus(),
            networkInterfaces: networkInterfaces(),
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
