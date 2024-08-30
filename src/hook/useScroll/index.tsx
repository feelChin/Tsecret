import { useEffect, useState } from "react";

function Index(refEl: React.MutableRefObject<HTMLDivElement | null>) {
	const [point, setPoint] = useState<number>(0);

	useEffect(() => {
		const el = refEl.current;

		function scrollFn() {
			if (el) {
				setPoint(el.scrollTop);
			}
		}

		if (el) {
			el.addEventListener("scroll", scrollFn);
		}

		return () => {
			if (el) {
				el.removeEventListener("scroll", scrollFn);
			}
		};
	}, []);

	return point;
}

export default Index;
