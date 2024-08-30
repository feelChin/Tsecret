import { useEffect, useRef } from "react";

interface i_ref {
	fn: (v: any) => void;
	timer: NodeJS.Timeout | undefined;
}

function useDebounce(
	fn: (v: any) => void,
	delay: number = 300,
	immediate: boolean = true
) {
	const ref = useRef<i_ref>({
		fn,
		timer: undefined,
	});

	useEffect(() => {
		ref.current.fn = fn;
	}, [fn]);

	let myDebounce = function (this: any) {
		const args = [...arguments];
		ref.current.timer && clearTimeout(ref.current.timer);

		//立即执行
		if (immediate) {
			!ref.current.timer && ref.current.fn.apply(this, args as any);
			ref.current.timer = setTimeout(() => {
				ref.current.timer = undefined;
			}, delay);
		} else {
			ref.current.timer = setTimeout(() => {
				ref.current.fn.apply(this, args as any);
			}, delay);
		}
	};

	(myDebounce as any).cancel = () => {
		clearTimeout(ref.current.timer);
		ref.current.timer = undefined;
	};

	return myDebounce;
}
export default useDebounce;
