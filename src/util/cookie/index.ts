export const getCookieData = (cookieName: string) => {
	let cookies = document.cookie.split(";");
	// 遍历每个 cookie，查找指定名称的 cookie
	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i].trim();
		// 判断是否是指定的 cookie
		if (cookie.startsWith(cookieName + "=")) {
			// 获取 cookie 的值
			let cookieValue = cookie.substring(cookieName.length + 1);
			// 解码 JSON 字符串并返回
			let v = cookieValue;
			try {
				v = JSON.parse(cookieValue);
			} catch {}
			return v;
		}
	}
	// 如果没有找到指定名称的 cookie，则返回 null
	return "";
};

export const setCookieData = (
	cookieName: string,
	data: string,
	expirationDays: number = 7
) => {
	// 将数据转换为JSON字符串
	let jsonData = JSON.stringify(data);

	// 计算过期时间
	let expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + expirationDays);

	// 设置 cookie
	document.cookie = `${cookieName}=${jsonData}; expires=${expirationDate.toUTCString()}; path=/`;
};

export const removeCookieData = (name: string) => {
	document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const clearCookieData = () => {
	let cookies = document.cookie.split(";");

	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i];
		removeCookieData(cookie);
	}
};
