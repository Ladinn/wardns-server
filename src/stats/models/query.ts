import { Document, Schema, Model, model} from "mongoose";

export interface QueryStat extends Document {
	name: string,
	count: {
		A: number,
		AAAA: number,
		CAA: number,
		CNAME: number,
		DNAME: number,
		DNSKEY: number,
		DS: number,
		HINFO: number,
		MX: number,
		NS: number,
		NSEC: number,
		NSEC3: number,
		NULL: number,
		OPT: number,
		PTR: number,
		RP: number,
		RRSIG: number,
		SOA: number,
		SRV: number,
		TXT: number
	}
}

export const QueryStat: Schema = new Schema({
	name: { type: String, unique: true, index: true },
	count: {
		A: Number,
		AAAA: Number,
		CAA: Number,
		CNAME: Number,
		DNAME: Number,
		DNSKEY: Number,
		DS: Number,
		HINFO: Number,
		MX: Number,
		NS: Number,
		NSEC: Number,
		NSEC3: Number,
		NULL: Number,
		OPT: Number,
		PTR: Number,
		RP: Number,
		RRSIG: Number,
		SOA: Number,
		SRV: Number,
		TXT: Number
	}
}, { collection: 'queries' });

export const Query: Model<QueryStat> = model<QueryStat>("QueryStat", QueryStat);