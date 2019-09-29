import { Document, Schema, Model, model} from "mongoose";

export interface BlockedModel extends Document {
	name: string,
	count: {
		A: number,
		AAAA: number
	}
}

export const BlockedSchema: Schema = new Schema({
	name: { type: String, unique: true, index: true },
	count: {
		A: Number,
		AAAA: Number
	}
}, { collection: 'blocked' });

export const Blocked: Model<BlockedModel> = model<BlockedModel>("Blocked", BlockedSchema);