import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  additionalInfo?: any;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    additionalInfo: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Índice para búsqueda por nombre
ProductSchema.index({ name: "text" });

export default mongoose.model<IProduct>("Product", ProductSchema);
