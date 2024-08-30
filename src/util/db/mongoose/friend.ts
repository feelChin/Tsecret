import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		friend_ids: {
			type: Array,
			required: [true, "请输入id"],
		},
		status: {
			type: Number,
			default: 0, //0 申请好友 1 好友
		},
	},
	{
		timestamps: true,
	}
);

const Index =
	mongoose.models.user_friend ||
	mongoose.model("user_friend", schema, "user_friend");

export default Index;
