"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import CommentList from "./commentList";
import style from "./page.module.scss";

interface i_props {
	id: string;
	p_id: string;
	goComment: (id: string, parent_id?: string | null) => void;
	children: ReactNode;
}

function Index(props: i_props) {
	const { children } = props;

	const ob = useRef<any | null>(null);
	const commentRef = useRef<HTMLDivElement | null>(null);

	const [fold, setFold] = useState<boolean>(false);
	const [height, setHeight] = useState<number>(0);

	useEffect(() => {
		const target = commentRef.current;

		if (!target) return;

		ob.current = new MutationObserver(() => {
			if (height !== target?.offsetHeight) {
				setHeight(target?.offsetHeight);
			}
		});

		ob.current.observe(target, {
			childList: true,
			attributes: true,
			characterData: true,
			subtree: true,
		});

		return () => {
			ob.current.disconnect();
		};
	}, [fold]);

	return (
		<section className={style.fold}>
			<div
				onClick={() => {
					setFold(!fold);
				}}
			>
				{children}
			</div>
			{fold && (
				<div className={style.foldWrapper} style={{ height }}>
					<div ref={commentRef} className={style.foldList}>
						<CommentList {...props} />
					</div>
				</div>
			)}
		</section>
	);
}

export default Index;
