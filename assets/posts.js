export async function loadPosts(){
  const res = await fetch("./data/posts.json", { cache: "no-store" });
  if(!res.ok) throw new Error("Não consegui carregar data/posts.json");
  const posts = await res.json();

  // Ordena por data (mais recente primeiro)
  posts.sort((a,b) => (b.date || "").localeCompare(a.date || ""));
  return posts;
}

export function formatDate(iso){
  if(!iso) return "";
  // Formato BR simples: dd/mm/aaaa
  const [y,m,d] = iso.split("-");
  if(!y||!m||!d) return iso;
  return `${d}/${m}/${y}`;
}

export function escapeHtml(str){
  return (str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}