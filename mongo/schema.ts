// Define the schema for the collection
import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
  site: {
    type: String,
    required: true,
  },
	views: {
		type: Number,
		default: 0,
	}
});

// Create the model for the collection
const Entry = mongoose.model('Entry', entrySchema, 'entries');

export default Entry;