export interface inter_param {
	page: number;
	page_size: number;
}

export interface inter_locale {
	params: { locale: string };
	searchParams: { [key: string]: string };
}
