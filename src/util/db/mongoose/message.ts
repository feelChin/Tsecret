import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		user_id: {
			type: String,
		},
		text: {
			type: String,
		},
		status: {
			type: Number,
			default: 0,
		},
		type: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// 会自动更改为复数 如user_infos 第三个参数是重命名
const Index =
	mongoose.models.user_message ||
	mongoose.model("user_message", schema, "user_message");

export default Index;
