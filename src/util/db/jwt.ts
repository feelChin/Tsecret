import jwt from "jsonwebtoken";

interface inter_param {
	[key: string]: any;
}

type verify = (req: Request) => Promise<inter_param>;

export const jwt_sign = (param: inter_param) => {
	return jwt.sign(param, process.env.NEXT_PUBLIC_SECRET_KEY as string, {
		expiresIn: process.env.NEXT_PUBLIC_JWT_EXPIRES,
	});
};

export const jwt_verify: verify = (req: Request) => {
	return new Promise((resolve, reject) => {
		try {
			const token = req.headers.get("token") as string;

			const decode = jwt.verify(
				token,
				process.env.NEXT_PUBLIC_SECRET_KEY as string
			);

			resolve(decode as inter_param);
		} catch {
			reject("登录已失效，请重新登录");
		}
	});
};
