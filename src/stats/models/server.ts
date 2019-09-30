import { Document, Schema, Model, model} from "mongoose";

export interface ServerModel extends Document {
	host: string,
	queries: number,
	bytes: number,
	blockedQueries: number
}

export const ServerSchema: Schema = new Schema({
	host: { type: String, unique: true, index: true },
	queries: Number,
	bytes: Number,
	blockedQueries: Number
}, { collection: 'servers' });

export const Server: Model<ServerModel> = model<ServerModel>("Server", ServerSchema);