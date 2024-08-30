import style from "./index.module.scss";

type t_Type = "default" | "white";

function Index({ type = "default" }: { type?: t_Type }) {
	return (
		<div className={style.loaderBox}>
			<span
				className={`${style.loader} ${type === "default" ? "" : style.active}`}
			></span>
		</div>
	);
}

export default Index;
