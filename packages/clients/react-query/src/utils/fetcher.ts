export const fetcher = async (url: string) => await (await fetch(url)).json();
