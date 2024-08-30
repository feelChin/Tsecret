import { getCookieData, removeCookieData } from "@util/cookie";
import { myToken } from "@util/store";

interface inter_header {
	"Content-Type"?: string;
	token?: string | null;
}

interface inter_option {
	method: string;
	type?: string;
	headers?: inter_header;
	body?: any;
}

interface inter_controller {
	[key: number]: AbortController;
}

let fetchCount: number = 0;
let controller: inter_controller = {};

export const cancelHttp = (threshold: number = 1) => {
	const keyVaules = Object.keys(controller);

	const flag = threshold ? keyVaules[keyVaules.length - threshold] : null;

	for (let key in controller) {
		if (key == flag) return;
		controller[key].abort();
		delete controller[key];
	}
};

export default (url: string, option: inter_option, data?: any) => {
	let FETCH_TIMEOUT: number = 10000;
	let didTimeout: boolean = false;
	let timer: NodeJS.Timeout | null = null;

	fetchCount++;
	controller[fetchCount] = new AbortController();

	return new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			didTimeout = true;
			reject(new Error("请求超时"));
		}, FETCH_TIMEOUT);

		const { method, type, headers } = option;

		const param: any = {
			method,
			headers: { token: myToken(), ...headers } || {},
			signal: controller[fetchCount].signal,
		};

		if (method === "get" || method === "delete") {
			if (data) {
				for (let [key, value] of Object.entries(data)) {
					url += `${url.indexOf("?") === -1 ? "?" : "&"}${key}=${value}`;
				}
			}
		}

		if (method === "post" || method === "put") {
			switch (type) {
				case "form":
					delete param.headers["Content-Type"];

					let formData = new FormData();
					for (let key of Object.keys(data)) {
						if (
							Object.prototype.toString.call(data[key]) === "[object Array]"
						) {
							data[key].map((item: any) => {
								formData.append(key, item);
							});
						} else {
							formData.append(key, data[key]);
						}
					}
					param.body = formData;
					break;
				case "default":
					param.body = JSON.stringify(data);
					param.headers["Content-Type"] = "application/x-www-form-urlencoded";
					break;
				default:
					param.body = JSON.stringify(data);
					param.headers["Content-Type"] = "application/json";
			}
		}

		fetch(url, { ...param })
			.then((response) => {
				if (timer) clearTimeout(timer);
				return response.json();
			})
			.then((response) => {
				if (response.code !== 200) {
					reject(response.msg || response.errmsg);
				}
				if (!didTimeout) {
					resolve(response);
				}
			})
			.catch((err) => {
				if (didTimeout) return;
				reject(err);
			});
	})
		.then((response) => {
			return response;
		})
		.catch((err) => {
			if (String(err).indexOf("abort") > -1) return new Promise(() => {});

			if (err === "登录已失效，请重新登录") {
				removeCookieData("token");
				const locale = getCookieData("NEXT_LOCALE");

				console.log("登录已失效，请重新登录");

				return;

				window.location.href = `/${locale}/login`;

				return new Promise(() => {});
			}
			throw err;
		});
};
