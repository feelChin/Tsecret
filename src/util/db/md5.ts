import crypto from "crypto"; // 引入crypto加密模块

export default (v: any) => {
	return crypto
		.createHash("md5")
		.update("" + v)
		.digest("hex");
};
