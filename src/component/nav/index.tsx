"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import style from "./index.module.scss";

function Index() {
	const locale = useLocale();
	const pathname = usePathname();

	const nav = [
		{
			name: "wb-shouye",
			path: `/${locale}`,
		},
		{
			name: "wb-sousuo",
			path: `/${locale}/search`,
		},
		{
			name: "wb-lingdang",
			path: `/${locale}/dynamic`,
		},
		{
			name: "wb-xinxi",
			path: `/${locale}/message`,
		},
	];

	return (
		<div className={style.nav}>
			{nav.map(({ name, path }) => {
				return (
					<Link
						key={path}
						className={`${style.item} ${pathname === path ? style.active : ""}`}
						href={path}
					>
						<i className={`iconfont ${name}`}></i>
					</Link>
				);
			})}
		</div>
	);
}

export default Index;
