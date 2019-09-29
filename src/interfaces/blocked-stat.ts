import { Document, Schema, Model, model} from "mongoose";

export interface BlockedStatModel extends Document {
	name: string,
	count: {
		A: number,
		AAAA: number
	}
}

export const BlockedStatSchema: Schema = new Schema({
	name: { type: String, unique: true, index: true },
	count: {
		A: Number,
		AAAA: Number
	}
}, { collection: 'blocked' });

export const BlockedStat: Model<BlockedStatModel> = model<BlockedStatModel>("BlockedStat", BlockedStatSchema);