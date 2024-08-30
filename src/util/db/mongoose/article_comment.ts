import mongoose from "mongoose";

const schema = new mongoose.Schema(
	{
		user_id: {
			type: String,
			required: [true, "请输入用户id"],
		},
		article_id: {
			type: String,
			required: [true, "请输入文章id"],
		},
		content: {
			type: String,
			required: [true, "请输入评论内容"],
		},
		parent_id: {
			type: String,
		},
		count: {
			type: Number,
		},
	},
	{
		timestamps: true,
	}
);

const Index =
	mongoose.models.article_comment ||
	mongoose.model("article_comment", schema, "article_comment");

export default Index;
