import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		user_id: {
			type: String,
			required: [true, "请输入用户id"],
		},
		follow_id: {
			type: String,
			required: [true, "请输入关注人id"],
		},
	},
	{
		timestamps: true,
	}
);

schema.index({ user_id: 1, follow_id: 1 }, { unique: true });

const Index =
	mongoose.models.follow || mongoose.model("follow", schema, "follow");

export default Index;
