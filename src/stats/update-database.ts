///<reference path="../../typings/dns-packet.d.ts" />

import {Answer, Packet} from "dns-packet";
import {QueryStat} from "../interfaces/query-stat";
import {RemoteInfo} from "dgram";
import {BlockedStat} from "../interfaces/blocked-stat";
import {ClientStat} from "../interfaces/client-stat";

export function upsertQuery(packet: Packet) {
	packet.questions.forEach(question => {
		let count: { [key: string]: number } = {};
		count[`count.${question.type}`] = 1;
		QueryStat.findOneAndUpdate(
			{ name: question.name }, { $inc: count }, { upsert: true },
			(error) => {
				if (error) {
					console.error(error);
				}
			}
		);
	});
}

export function upsertBlocked(answer: Answer) {
	let count: { [key: string]: number } = {};
	count[`count.${answer.type}`] = 1;
	BlockedStat.findOneAndUpdate(
		{ name: answer.name }, { $inc: count }, { upsert: true },
		(error) => {
			if (error) {
				console.error(error);
			}
		}
	);
}

export function upsertClient(rinfo: RemoteInfo) {
	let count: { [key: string]: number } = {
		queries: 1,
		bytes: rinfo.size
	};
	ClientStat.findOneAndUpdate(
		{ ip: rinfo.address }, { $inc: count }, { upsert: true },
		(error) => {
			if (error) {
				console.error(error);
			}
		}
	)
}