export const removeDuplication = (arr: any[] = [], id: string) => {
	let obj: any = {};
	return arr.reduce((acc, cur) => {
		obj[cur[id]] ? null : (obj[cur[id]] = true && acc.push(cur));
		return acc;
	}, []);
};
