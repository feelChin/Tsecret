import dayjs from "dayjs";

export const renderTimeFormat = (time: string, text: string = "") => {
	const diff = Math.floor(dayjs().diff(dayjs(time), "hour", true));

	if (diff <= 1) {
		text = "刚刚发布";
	}

	if (diff > 1) {
		text = diff + "h";
	}

	if (diff > 24) {
		text = "一天前";
	}

	if (diff > 48) {
		text = "两天前";
	}

	if (diff > 72) {
		text = "三天前";
	}

	if (diff > 168) {
		text = "一周前";
	}

	if (diff > 192) {
		text = dayjs(time).format("YYYY-MM-DD");
	}

	return text;
};
