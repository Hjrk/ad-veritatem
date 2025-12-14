import { loadPosts, formatDate, escapeHtml } from "./posts.js";

function setActiveMenu(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a=>{
    const href = a.getAttribute("href");
    if(href === path) a.classList.add("active");
  });
}

function renderPostItem(p, { showContent=false } = {}){
  const title = escapeHtml(p.title);
  const date = formatDate(p.date);
  const book = escapeHtml(p.bibleBook || "");
  const ref = escapeHtml(p.bibleRef || "");
  const excerpt = escapeHtml(p.excerpt || "");
  const topics = Array.isArray(p.topics) ? p.topics : [];
  const tags = topics.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const content = showContent
    ? `<hr class="sep"><div class="small" style="white-space:pre-wrap">${escapeHtml(p.content || "")}</div>`
    : "";

  return `
    <article class="post">
      <div class="kicker">${book}${ref ? " • " + ref : ""}</div>
      <h2>${title}</h2>
      <div class="meta">
        <span>📅 ${date}</span>
        <span>🏷️ ${topics.length ? escapeHtml(topics.join(", ")) : "Sem temas"}</span>
      </div>
      ${excerpt ? `<p class="small">${excerpt}</p>` : ""}
      ${tags}
      ${content}
    </article>
  `;
}

async function homePage(){
  const list = document.querySelector("#recentPosts");
  if(!list) return;

  try{
    const posts = await loadPosts();
    const latest = posts.slice(0, 8);
    list.innerHTML = latest.map(p => renderPostItem(p)).join("");
  }catch(err){
    list.innerHTML = `<div class="pad notice">Erro: ${escapeHtml(err.message)}</div>`;
  }
}

function uniq(arr){ return [...new Set(arr)].filter(Boolean); }

async function arquivosPage(){
  const container = document.querySelector("#archiveResults");
  const q = document.querySelector("#q");
  const bookSel = document.querySelector("#book");
  const topicSel = document.querySelector("#topic");
  const count = document.querySelector("#count");
  if(!container || !q || !bookSel || !topicSel || !count) return;

  let posts = [];
  try{
    posts = await loadPosts();
  }catch(err){
    container.innerHTML = `<div class="pad notice">Erro: ${escapeHtml(err.message)}</div>`;
    return;
  }

  // Preenche selects
  const books = uniq(posts.map(p => p.bibleBook)).sort((a,b)=>a.localeCompare(b));
  const topics = uniq(posts.flatMap(p => Array.isArray(p.topics) ? p.topics : [])).sort((a,b)=>a.localeCompare(b));

  bookSel.innerHTML = `<option value="">Todos os livros</option>` + books.map(b=>`<option>${escapeHtml(b)}</option>`).join("");
  topicSel.innerHTML = `<option value="">Todos os temas</option>` + topics.map(t=>`<option>${escapeHtml(t)}</option>`).join("");

  function apply(){
    const term = q.value.trim().toLowerCase();
    const book = bookSel.value;
    const topic = topicSel.value;

    const filtered = posts.filter(p=>{
      const hay = [
        p.title, p.excerpt, p.content, p.bibleBook, p.bibleRef,
        ...(Array.isArray(p.topics) ? p.topics : [])
      ].join(" ").toLowerCase();

      const okTerm = !term || hay.includes(term);
      const okBook = !book || (p.bibleBook === book);
      const okTopic = !topic || (Array.isArray(p.topics) && p.topics.includes(topic));
      return okTerm && okBook && okTopic;
    });

    count.textContent = `${filtered.length} texto(s)`;

    container.innerHTML = filtered
      .map(p => renderPostItem(p, { showContent:true }))
      .join("") || `<div class="pad notice">Nenhum texto encontrado com esses filtros.</div>`;
  }

  q.addEventListener("input", apply);
  bookSel.addEventListener("change", apply);
  topicSel.addEventListener("change", apply);

  apply();
}

function pixCopy(){
  const btn = document.querySelector("#copyPix");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const keyEl = document.querySelector("#pixKey");
    const key = (keyEl?.textContent || "").trim();
    if(!key || key === "COLE_SUA_CHAVE_PIX_AQUI") return;

    try{
      await navigator.clipboard.writeText(key);
      btn.textContent = "Copiado!";
      setTimeout(()=>btn.textContent="Copiar PIX", 1200);
    }catch{
      btn.textContent = "Não deu :(";
      setTimeout(()=>btn.textContent="Copiar PIX", 1200);
    }
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  setActiveMenu();
  homePage();
  arquivosPage();
  pixCopy();
});