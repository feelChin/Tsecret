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
	},
	{
		timestamps: true,
	}
);

schema.index({ user_id: 1, article_id: 1 }, { unique: true });

const Index =
	mongoose.models.article_like ||
	mongoose.model("article_like", schema, "article_like");

export default Index;
