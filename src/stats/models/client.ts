import { Document, Schema, Model, model} from "mongoose";

export interface ClientModel extends Document {
	ip: string,
	queries: number,
	bytes: number
}

export const ClientSchema: Schema = new Schema({
	ip: { type: String, unique: true, index: true },
	queries: Number,
	bytes: Number
}, { collection: 'clients' });

export const Client: Model<ClientModel> = model<ClientModel>("Client", ClientSchema);