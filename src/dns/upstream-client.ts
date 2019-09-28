import { Socket } from "net";
import { Packet, streamEncode, streamDecode } from "dns-packet";

const upstream = process.env.UPSTREAM_NS.split(',');

export function query(packet: Packet): Promise<Packet> {
	return new Promise((resolve, reject) => {

		const data = streamEncode(packet);

		const client = new Socket();
		const dest = randomUpstreamAddress();

		let response: Buffer = null;
		let expectedLength: number = 0;

		client.connect(53, dest, () => client.write(data));

		client.on('data', (data: Buffer) => {

			if (response == null) {
				if (data.byteLength > 1) {
					const plen = data.readUInt16BE(0);
					expectedLength = plen;
					if (plen < 12) {
						reject(new Error('Response from upstream nameserver is below the DNS minimum packet length.'));
					}
					response = Buffer.from(data)
				}
			} else {
				response = Buffer.concat([response, data])
			}

			if (response.byteLength >= expectedLength) {
				client.destroy();
				resolve(streamDecode(response));
			}

		});

		client.on('error', (error) => {
			client.destroy();
			console.error(`Socket error while communicating with ${dest}: ${error.message}`);
			resolve(query(packet));
		});

	});
}

function randomUpstreamAddress(): string {
	return upstream[Math.floor(Math.random() * upstream.length)];
}