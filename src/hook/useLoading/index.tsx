import { useEffect, useRef, useState } from "react";

const useLoading = () => {
	const timer = useRef<NodeJS.Timeout>();
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!loading) {
			timer.current = setTimeout(() => {
				setLoading(true);
			}, 100);
		}
		return () => clearTimeout(timer.current);
	}, [loading]);

	return { loading, setLoading };
};

export default useLoading;
