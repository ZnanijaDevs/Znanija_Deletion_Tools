export default async (path: string) => {
  const r = await fetch(path);

  if (r.status === 410) throw Error("Удалено");

  const text = await r.text();
  
  return new DOMParser().parseFromString(text, "text/html");
};