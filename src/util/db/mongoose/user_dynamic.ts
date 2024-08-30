import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		user_id: {
			type: String,
		},
		article_id: {
			type: String,
		},
		text: {
			type: String,
		},
		type: {
			// 0 文章发布  1点赞 2评论 3转发
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

const Index =
	mongoose.models.user_dynamic ||
	mongoose.model("user_dynamic", schema, "user_dynamic");

export default Index;
