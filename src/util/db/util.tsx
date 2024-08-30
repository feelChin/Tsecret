export const roll = (pool: string[]) => {
	const key = String(pool.length * Math.random());

	return pool[parseInt(key)];
};

export const avatarPool: string[] = [
	"/img/avatar/0.jpg",
	"/img/avatar/1.jpg",
	"/img/avatar/2.jpg",
	"/img/avatar/3.jpg",
	"/img/avatar/4.jpg",
	"/img/avatar/5.jpg",
];

export const base_total = (req: Request) => {
	const { searchParams } = new URL(req.url);

	const page = Number(searchParams.get("page")) || 1;
	const page_size = Number(searchParams.get("page_size")) || 10;

	const skip = page * 10 - 10;

	return {
		$facet: {
			metadata: [{ $count: "total" }],
			data: [{ $skip: skip }, { $limit: page_size }],
		},
	};
};

// 洗牌
export const shuffleArray = (array: any[]) => {
	let shuffledArray = array.slice();
	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
	}
	return shuffledArray;
};
