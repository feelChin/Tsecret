import { useEffect, useRef, useState } from "react";

type Callback = () => void;

const useMyState = <T,>(
	initState: T
): [T, (state: T, callback?: () => void) => void] => {
	const [state, setState] = useState<T>(initState);
	const isUpdate = useRef<Callback | null>(null);

	const setUpdateState = (newState: T, cb?: Callback) => {
		if (cb) isUpdate.current = cb;
		setState(newState);
	};

	useEffect(() => {
		if (isUpdate.current) {
			isUpdate.current();
			isUpdate.current = null;
		}
	}, [state]);

	return [state, setUpdateState];
};

export default useMyState;
