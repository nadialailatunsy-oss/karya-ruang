const KEY="karya-ruang-v1";
const G={material:{l:"Material bangunan",c:"mat",s:["Semen","Pasir","Batu bata","Keramik","Cat","Triplek","Besi"]},properti:{l:"Properti interior",c:"prop",s:["Kursi","Meja","Lampu","Hiasan dinding","Sofa","Rak"]},upah:{l:"Upah dan kasbon",c:"upah",s:["Upah tukang","Upah mandor","Kasbon"]}};
const $=s=>document.querySelector(s);
const rp=n=>"Rp "+new Intl.NumberFormat("id-ID").format(Math.round(n));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const today=()=>new Date().toISOString().slice(0,10);
const pc=n=>Math.round(n);

function seed(){
  const d=n=>{const t=new Date();t.setDate(t.getDate()-n);return t.toISOString().slice(0,10)};
  const P=(nama,anggaran,progres,rows)=>({id:uid(),nama,anggaran,progres,items:rows.map((r,i)=>({id:uid(),tgl:d(rows.length*2-i*2),grup:r[0],nama:r[1],jumlah:r[2],ket:r[3]||""}))});
  const ps=[
    P("Kafe Bu Sinta",320e6,55,[["material","Semen dan pasir",38.5e6,"Toko Bangun Jaya"],["material","Keramik lantai",54e6],["material","Plafon gypsum dan rangka",61e6],["material","Cat dan finishing",22e6],["properti","Meja dan kursi kafe",41e6],["properti","Lampu gantung",14.2e6],["properti","Hiasan dinding dan tanaman",6.3e6],["upah","Upah tukang minggu 1-3",12.6e6,"Pak Joko"]]),
    P("Kantor PT Maju",950e6,40,[["material","Partisi kaca dan rangka",150e6],["material","Lantai vinyl",60e6],["properti","Meja kerja 20 unit",45e6],["properti","Kursi ergonomis",15e6],["upah","Upah tim minggu 1-4",30e6]]),
    P("Apartemen Pak Hendra",180e6,70,[["material","Kitchen set dan plafon",98e6],["properti","Sofa, meja makan, kursi",44e6],["properti","Lampu dan hiasan",17.5e6],["upah","Upah tukang",27e6]])
  ];
  return {aktif:ps[0].id,proyek:ps};
}
function load(){try{const r=localStorage.getItem(KEY);if(r){const s=JSON.parse(r);if(s&&s.proyek&&s.proyek.length)return s}}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

let S=load(),filter="semua",grup="material",resetArmed=false,view="home";
const cur=()=>S.proyek.find(p=>p.id===S.aktif)||S.proyek[0];

function hitung(p){
  const g={material:0,properti:0,upah:0};p.items.forEach(i=>g[i.grup]+=i.jumlah);
  const total=g.material+g.properti+g.upah,pct=total/p.anggaran*100;
  const selesai=p.progres>=100;let st="ok";if(pct>100)st="bad";else if(!selesai&&(pct>=80||pct-p.progres>=15))st="warn";
  return {g,total,pct,st,selesai};
}
function pesan(p,h){
  if(h.selesai){const s=p.anggaran-h.total;return s>=0?`Progres selesai. Biaya di bawah anggaran, sisa ${rp(s)} jadi laba.`:`Progres selesai. Biaya melebihi anggaran ${rp(-s)}, proyek rugi.`}
  if(h.st==="bad")return `Anggaran terlampaui ${rp(h.total-p.anggaran)}. Tahan pembelian sampai ada persetujuan.`;
  if(h.pct>=80)return `Biaya sudah ${pc(h.pct)}% dari anggaran, sisa ${rp(p.anggaran-h.total)}. Mendekati batas.`;
  if(h.st==="warn")return `Biaya ${pc(h.pct)}%, progres baru ${p.progres}%. Biaya jalan lebih cepat dari pekerjaan.`;
  return `Biaya terkendali: ${pc(h.pct)}% anggaran terpakai, progres ${p.progres}%.`;
}
function toast(m,t="ok"){
  const e=document.createElement("div");e.className="toast "+t;e.textContent=m;$("#toasts").appendChild(e);
  setTimeout(()=>e.remove(),5200);
}

function renderTabs(){
  $("#tabs-list").innerHTML=S.proyek.map(p=>{const h=hitung(p),c=h.st==="ok"?"":h.st;const lab=h.selesai?(h.st==="bad"?"Selesai, rugi "+rp(h.total-p.anggaran):"Selesai, laba "+rp(p.anggaran-h.total)):h.st==="bad"?"Melebihi anggaran "+rp(h.total-p.anggaran):h.st==="warn"?"Perlu dicek":"Terkendali";return `<button class="pcard ${c}" data-id="${p.id}"><span class="pt"><span class="dot ${c}"></span>${esc(p.nama)}</span><span class="pl">${lab}</span><span class="pm">Biaya ${pc(h.pct)}% dari ${rp(p.anggaran)}, progres ${p.progres}%</span><span class="pb"><i style="width:${Math.min(100,h.pct)}%"></i><u style="left:${Math.min(99,p.progres)}%"></u></span></button>`}).join("");
}
function renderSum(){
  const p=cur(),h=hitung(p),scale=Math.max(110,h.pct+6),w=v=>(v/p.anggaran*100/scale*100).toFixed(2)+"%",x=v=>(v/scale*100).toFixed(2)+"%";
  const sisa=p.anggaran-h.total;
  $("#sum").innerHTML=`
  <div class="status ${h.st==="ok"?"":h.st}" role="${h.st==="ok"?"status":"alert"}"><p class="hero">${esc(pesan(p,h))}</p><small>${esc(p.nama)}</small></div>
  <div class="tapewrap"><div class="tape" aria-hidden="true">${["material","properti","upah"].map(k=>`<i class="${G[k].c}" style="width:${w(h.g[k])}"></i>`).join("")}</div>
    <div class="mk" style="left:${x(80)}"><span>80% waspada</span></div>
    <div class="mk" style="left:${x(100)}"><span>100% batas</span></div>
    <div class="mk prog" style="left:${x(p.progres)}"><span>progres ${p.progres}%</span></div></div>
  <div class="legend">${["material","properti","upah"].map(k=>`<span><i class="sw ${G[k].c}"></i>${G[k].l} ${rp(h.g[k])}</span>`).join("")}</div>
  <dl class="facts"><div><dt>Anggaran</dt><dd>${rp(p.anggaran)}</dd></div><div><dt>Terpakai</dt><dd>${rp(h.total)}</dd></div><div><dt>${sisa<0?"Kelebihan":"Sisa"}</dt><dd style="color:var(--${sisa<0?"bad":"ink"})">${rp(Math.abs(sisa))}</dd></div></dl>`;
  $("#prog").value=p.progres;$("#pv").textContent=p.progres+"%";
}
function renderForm(){
  $("#seg").innerHTML=Object.keys(G).map(k=>`<button type="button" data-g="${k}" aria-pressed="${k===grup}" style="--c:var(--${G[k].c})">${G[k].l}</button>`).join("");
  $("#chips").innerHTML=G[grup].s.map(s=>`<button type="button" data-s="${esc(s)}">${esc(s)}</button>`).join("")+`<button type="button" class="other" data-other="1">Lainnya</button>`;
  $("#nama").placeholder="Contoh: Semen 10 sak";
}
function renderList(){
  const p=cur();
  $("#filters").innerHTML=[["semua","Semua"],...Object.keys(G).map(k=>[k,G[k].l])].map(([k,l])=>`<button type="button" data-f="${k}" aria-pressed="${k===filter}">${l}</button>`).join("");
  const items=p.items.filter(i=>filter==="semua"||i.grup===filter).sort((a,b)=>b.tgl.localeCompare(a.tgl));
  $("#rows").innerHTML=items.length?items.map(i=>`<tr><td>${esc(i.tgl.split("-").reverse().join("/"))}</td><td>${esc(i.nama)}${i.ket?`<small>${esc(i.ket)}</small>`:""}</td><td><i class="sw ${G[i.grup].c}"></i>${G[i.grup].l.split(" ")[0]}</td><td class="n">${rp(i.jumlah)}</td><td><button class="x" data-del="${i.id}" aria-label="Hapus ${esc(i.nama)}">&times;</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Belum ada pengeluaran di sini. Catat yang pertama lewat formulir.</td></tr>`;
  const n=S.proyek.reduce((a,q)=>a+q.items.length,0);
  $("#storeinfo").textContent=`${n} catatan di ${S.proyek.length} proyek tersimpan otomatis di browser ini.`;
}
function show(){const d=view==="detail";document.querySelectorAll(".dv").forEach(e=>e.hidden=!d);document.querySelectorAll(".hv").forEach(e=>e.hidden=d)}
function render(){renderTabs();renderSum();renderList();preview();show()}
function preview(){
  const p=cur(),h=hitung(p),v=Number($("#jumlah").value),el=$("#hint");
  if(!(v>0)){el.className="hint";el.textContent="";return}
  const after=(h.total+v)/p.anggaran*100;
  el.className="hint "+(after>100?"bad":after>=80?"warn":"");
  el.textContent=after>100?`Setelah dicatat: ${pc(after)}% dari anggaran. Melewati batas.`:`Setelah dicatat: ${pc(after)}% dari anggaran.`;
}

document.addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  if(t.id==="back"){view="home";render();window.scrollTo(0,0)}
  else if(t.dataset.id){S.aktif=t.dataset.id;filter="semua";view="detail";save();render();window.scrollTo(0,0)}
  else if(t.dataset.g){grup=t.dataset.g;renderForm()}
  else if(t.dataset.s){$("#nama").value=t.dataset.s;$("#nama").focus()}
  else if(t.dataset.other){$("#nama").value="";$("#nama").placeholder="Ketik nama barang lainnya";$("#nama").focus()}
  else if(t.dataset.f){filter=t.dataset.f;renderList()}
  else if(t.dataset.del){const p=cur();p.items=p.items.filter(i=>i.id!==t.dataset.del);save();render();toast("Pengeluaran dihapus.")}
});
$("#jumlah").addEventListener("input",preview);
$("#form").addEventListener("submit",e=>{
  e.preventDefault();
  const p=cur(),nama=$("#nama").value.trim(),jumlah=Number($("#jumlah").value);
  if(!nama||!(jumlah>0)){toast("Isi nama item dan biaya lebih dari 0.","bad");return}
  p.items.push({id:uid(),tgl:$("#tgl").value||today(),grup,nama,ket:$("#ket").value.trim(),jumlah});
  save();$("#nama").value="";$("#jumlah").value="";$("#ket").value="";render();
  const h=hitung(p);
  toast(h.st==="bad"?`Peringatan: anggaran ${p.nama} terlampaui ${rp(h.total-p.anggaran)}.`:h.pct>=80&&!h.selesai?`Hati-hati: biaya ${p.nama} sudah ${pc(h.pct)}% dari anggaran.`:h.st==="warn"?`Biaya ${pc(h.pct)}% tapi progres baru ${p.progres}%. Cek pengeluaran.`:`Tercatat: ${nama}, ${rp(jumlah)}.`,h.st);
});
$("#prog").addEventListener("input",e=>{cur().progres=Number(e.target.value);save();render()});
$("#addp").addEventListener("click",()=>{
  const n=$("#pn").value.trim(),a=Number($("#pa").value);
  if(!n||!(a>0)){toast("Isi nama proyek dan anggaran.","bad");return}
  const p={id:uid(),nama:n,anggaran:a,progres:0,items:[]};S.proyek.push(p);S.aktif=p.id;save();$("#pn").value="";$("#pa").value="";render();toast("Proyek ditambahkan.");
});
$("#reset").addEventListener("click",e=>{
  if(!resetArmed){resetArmed=true;e.target.textContent="Klik lagi untuk menghapus semua data";setTimeout(()=>{resetArmed=false;e.target.textContent="Kembalikan data contoh"},4000);return}
  resetArmed=false;e.target.textContent="Kembalikan data contoh";S=seed();view="home";save();render();toast("Data contoh dikembalikan.");
});
let dl=null;
if(window.claude&&claude.use){claude.use("downloads").then(x=>{dl=x;if(x)$("#csv").hidden=false}).catch(()=>{})}
$("#csv").addEventListener("click",()=>{
  const q=v=>`"${String(v).replace(/"/g,'""')}"`;
  const rows=[["Proyek","Tanggal","Jenis","Item","Catatan","Biaya"]];
  S.proyek.forEach(p=>p.items.forEach(i=>rows.push([p.nama,i.tgl,G[i.grup].l,i.nama,i.ket,i.jumlah])));
  dl.save({filename:"pengeluaran-karya-ruang.csv",data:new Blob([rows.map(r=>r.map(q).join(",")).join("\n")],{type:"text/csv"})}).catch(err=>{if(err&&err.code!=="declined")toast("Unduhan tidak tersedia di sini.","warn")});
});

$("#tgl").value=today();
renderForm();render();
