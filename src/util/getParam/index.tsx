export default function (_param: string, result: string = "") {
	const url = window.location.search;

	if (url.indexOf(_param) === -1) {
		return "";
	}

	let params = url.split("?");

	if (params[1].indexOf("&") > -1) {
		params = params[1].split("&");
	}

	try {
		params.forEach((item) => {
			if (item.indexOf(_param + "=") > -1) {
				result = item.replace(_param + "=", "");
				throw Error();
			}
		});
	} catch {}

	return decodeURIComponent(result);
}
