import { Document, Schema, Model, model} from "mongoose";

export interface ClientStatModel extends Document {
	ip: string,
	queries: number,
	bytes: number
}

export const ClientStatSchema: Schema = new Schema({
	ip: { type: String, unique: true, index: true },
	queries: Number,
	bytes: Number
}, { collection: 'clients' });

export const ClientStat: Model<ClientStatModel> = model<ClientStatModel>("ClientStat", ClientStatSchema);