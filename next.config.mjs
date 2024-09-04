import createNextIntlPlugin from "next-intl/plugin";
import cron from "node-cron";

//定时任务
// cron.schedule("* * * * *", async () => {
// 	try {
// 		await fetch(`/[locale]/api/article/list`, {
// 			method: "put",
// 		});
// 		console.log("执行任务");
// 	} catch (err) {
// 		console.log(err);
// 	}
// });

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s2.loli.net",
				port: "",
				pathname: "/**",
			},
		],
	},
};

export default withNextIntl(nextConfig);
