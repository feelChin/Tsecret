import Link from "next/link";
import { getLocale } from "next-intl/server";
import style from "./index.module.scss";

async function Index() {
	const locale = await getLocale();
	return (
		<div className={style.editMenu}>
			<Link href={`${locale}/edit`}>
				<i className="iconfont wb-xiezuo"></i>
			</Link>
		</div>
	);
}

export default Index;
