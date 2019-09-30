import { Document, Schema, Model, model} from "mongoose";

export interface TimeModel extends Document {
	date: Date,
	host: string,
	sys: {
		load: number,
		mem: number
	},
	queries: number,
	bytes: number,
	blockedQueries: number,
	clients: string[],
	upstreamErrors: number
}

export const TimeSchema: Schema = new Schema({
	date: Date,
	host: String,
	sys: {
		load: Number,
		mem: Number
	},
	queries: Number,
	bytes: Number,
	blockedQueries: Number,
	clients: [String],
	upstreamErrors: Number
}, { collection: 'time' });

export const Time: Model<TimeModel> = model<TimeModel>("Time", TimeSchema);