'use strict';
const KEY='contagem-ccb-v1';
const initial=()=>({campos:{servico:'',atendimento:'',livro:'',capitulo:'',versiculo:'',localidade:'',data:''},regencia:[],instrumentos:[],cargos:[],hinos:[]});
let state;try{let saved=JSON.parse(localStorage.getItem(KEY));state=saved&&saved.campos&&Array.isArray(saved.regencia)&&Array.isArray(saved.instrumentos)&&Array.isArray(saved.cargos)&&Array.isArray(saved.hinos)?saved:initial()}catch{state=initial()}
const ids=['servico','atendimento','livro','capitulo','versiculo','localidade','data'];
const names={regencia:'Regência',instrumentos:'Instrumentos',cargos:'Ministério / Cargos',hinos:'Hinos Ensaiados'};
const $=id=>document.getElementById(id);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notice('Armazenamento bloqueado: seus dados podem não persistir.')}};
const notice=t=>{$('feedback').textContent=t;};
function render(){for(const id of ids){const el=$(id);if(document.activeElement!==el)el.value=state.campos[id]||'';}
for(const kind of ['regencia','instrumentos','cargos','hinos']){
 const el=$(kind+'List');el.replaceChildren();state[kind].forEach((item,index)=>{
  const row=document.createElement('div');row.className='entry';
  const text=document.createElement('span');text.className='entry-text';const n=kind==='regencia'?`${index+1}º `:'';
  text.textContent=n+(kind==='regencia'?`${item.irmao} - ${item.localidade} - ${item.cargo}`:kind==='hinos'?`Hino - ${item.nome}`:`${item.nome} - ${item.qtd}`);
  const edit=document.createElement('button');edit.type='button';edit.title='Editar';edit.setAttribute('aria-label',`Editar ${names[kind]} ${index+1}`);edit.innerHTML='<img src="assets/editar.png" alt="">';edit.onclick=()=>editItem(kind,index);
  const del=document.createElement('button');del.type='button';del.title='Excluir';del.setAttribute('aria-label',`Excluir ${names[kind]} ${index+1}`);del.innerHTML='<img src="assets/excluir.png" alt="">';del.onclick=()=>{if(confirm('Excluir este item?')){state[kind].splice(index,1);persist();render()}};
  row.append(text,edit,del);el.append(row);
 });
}
const total=$('totalList');total.replaceChildren();for(const item of state.cargos){let row=document.createElement('div');row.className='total-row';const l=document.createElement('span');l.textContent=item.nome;const r=document.createElement('strong');r.textContent=item.qtd;row.append(l,r);total.append(row)}
$('somaPessoas').textContent=state.cargos.reduce((sum,x)=>sum+Number(x.qtd||0),0);
$('somaInstrumentos').textContent=state.instrumentos.reduce((sum,x)=>sum+Number(x.qtd||0),0);
$('somaHinos').textContent=state.hinos.length;
}
function editItem(kind,index){let orig=state[kind][index];let updated={...orig};for(const field of Object.keys(orig)){
const friendly=({irmao:'Irmão',localidade:'Localidade',cargo:'Cargo',nome:'Nome',qtd:'Quantidade'})[field]||field;
const val=prompt(`Editar ${friendly}:`,orig[field]);if(val===null)return;const clean=val.trim();if(!clean){alert('O campo não pode ficar vazio.');return}
if(field==='qtd'){if(!/^\d+$/.test(clean)||+clean<1){alert('Quantidade inválida.');return}updated[field]=Number(clean)}else updated[field]=clean;
}state[kind][index]=updated;persist();render();notice('Item atualizado.');}
for(const id of ids){$(id).addEventListener('input',e=>{state.campos[id]=e.target.value;persist()})}
for(const kind of ['regencia','instrumentos','cargos','hinos']){$(kind+'Form').addEventListener('submit',e=>{
e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f));for(const [k,v] of Object.entries(data)){data[k]=String(v).trim();if(!data[k]){notice('Preencha todos os campos.');return}}
if('qtd'in data){if(!/^\d+$/.test(data.qtd)||+data.qtd<1){notice('Informe uma quantidade inteira maior que zero.');return}data.qtd=Number(data.qtd)}
state[kind].push(data);persist();f.reset();render();notice('Item adicionado!');f.querySelector('input')?.focus();
})}
function clearFields(){for(const id of ids)state.campos[id]='';for(const form of document.querySelectorAll('form'))form.reset();persist();render();notice('Campos de dados iniciais limpos. As listas permanecem salvas.')}
$('limparCampos').onclick=clearFields;
$('limpar').onclick=()=>{if(confirm('Limpar apenas os campos de dados iniciais? Os itens já adicionados serão preservados.'))clearFields()};
$('novoEvento').onclick=()=>{if(confirm('Começar um NOVO EVENTO? Todos os dados atuais serão apagados deste navegador.')){state=initial();persist();for(const form of document.querySelectorAll('form'))form.reset();render();notice('Novo evento iniciado.')}};
function datePt(v){if(!v)return '—';const [y,m,d]=v.split('-');return `${d}/${m}/${y}`}
function plainReport(){const c=state.campos;const lines=['CONTAGEM CCB','CONGREGAÇÃO CRISTÃ NO BRASIL','','DADOS INICIAIS',`Santo Serviço: ${c.servico||'—'}`,`Atendimento: ${c.atendimento||'—'}`,`Palavra: ${c.livro||'—'} | Capítulo: ${c.capitulo||'—'} | Versículo: ${c.versiculo||'—'}`,`Localidade: ${c.localidade||'—'}`,`Data: ${datePt(c.data)}`];
for(const kind of ['regencia','instrumentos','cargos','hinos']){lines.push('',names[kind].toUpperCase());if(!state[kind].length)lines.push('—');state[kind].forEach((it,i)=>lines.push(kind==='regencia'?`${i+1}º ${it.irmao} - ${it.localidade} - ${it.cargo}`:kind==='hinos'?`Hino - ${it.nome}`:`${it.nome} - ${it.qtd}`))}
lines.push('','TOTAL GERAL');for(const it of state.cargos)lines.push(`${it.nome}: ${it.qtd}`);lines.push(`Total Cargos / Ministérios: ${$('somaPessoas').textContent}`,`Total de Músicos: ${$('somaInstrumentos').textContent}`,`Hinos Ensaiados: ${$('somaHinos').textContent}`);return lines.join('\n')}
function reportHtml(){const c=state.campos;const field=(k,v)=>`<div><b>${escapeHtml(k)}:</b> ${escapeHtml(v||'—')}</div>`;const block=kind=>`<section><h2>${escapeHtml(names[kind])}</h2>${state[kind].length?state[kind].map((it,i)=>`<p>${escapeHtml(kind==='regencia'?`${i+1}º ${it.irmao} - ${it.localidade} - ${it.cargo}`:kind==='hinos'?`Hino - ${it.nome}`:`${it.nome} - ${it.qtd}`)}</p>`).join(''):'<p>—</p>'}</section>`;
return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Contagem CCB</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,Helvetica,sans-serif;color:#333;font-size:12px}header{display:flex;justify-content:space-between;border-bottom:2px solid #777;padding-bottom:10px;align-items:center}header .ccb{font-weight:bold;text-align:center;border:2px solid #333;padding:8px 12px}header .clave{font-size:35px}header .official-logo{display:block;max-width:220px;max-height:120px;object-fit:contain;margin:auto}section{border-bottom:1px solid #888;padding:10px 0;min-height:60px;break-inside:avoid}h2{font-size:13px;color:white;background:#777;border-radius:20px;display:inline-block;padding:3px 16px;margin:0 0 10px}p{margin:5px 0}b{font-weight:700}main{padding-top:8px}</style></head><body><header><img class="official-logo" src="${escapeHtml(new URL('assets/logo-ccb.png',location.href).href)}" alt="Congregação Cristã no Brasil"></header><main><section><h2>Dados Iniciais</h2>${field('Santo Serviço',c.servico)}${field('Atendimento',c.atendimento)}${field('Palavra',`${c.livro||'—'} | Capítulo: ${c.capitulo||'—'} | Versículo: ${c.versiculo||'—'}`)}${field('Localidade',c.localidade)}${field('Data',datePt(c.data))}</section>${['regencia','instrumentos','cargos','hinos'].map(block).join('')}<section><h2>Total Geral</h2>${state.cargos.map(it=>field(it.nome,it.qtd)).join('')}${field('Total Cargos / Ministérios',$('somaPessoas').textContent)}${field('Total de instrumentos',$('somaInstrumentos').textContent)}${field('Total de Hinos',$('somaHinos').textContent)}</section></main></body></html>`}
$('pdf').onclick=async()=>{try{notice('📄 Preparando PDF...');const blob=await createContagemPdf(state,datePt);const file=new File([blob],'CONTAGEM_CCB.pdf',{type:'application/pdf'});if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'CONTAGEM CCB'});notice('✅ PDF pronto para compartilhar!');return}catch(e){if(e.name==='AbortError'){notice('Compartilhamento cancelado.');return}}}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notice('✅ PDF criado e disponível para abrir ou compartilhar pelo celular.')}catch(e){console.error(e);notice('❌ Erro ao gerar PDF: '+e.message)}};
$('word').onclick=async()=>{try{await downloadContagemDocx(state,datePt);notice('Documento Word (.docx) com a logo oficial gerado.')}catch(e){console.error(e);notice('Não foi possível gerar o Word: '+e.message)}};
function whatsappReport(){const c=state.campos;const num=(kind)=>state[kind].reduce((n,it)=>n+Number(it.qtd||0),0);const line=(title,value)=>`${title}: ${value||'—'}`;const lines=['🎼 *CONTAGEM CCB*','⛪ *Congregação Cristã no Brasil*','','📋 *DADOS INICIAIS*',line('🙏 Santo Serviço',c.servico),line('🤝 Atendimento',c.atendimento),`📖 Palavra: ${c.livro||'—'} ${c.capitulo||'—'}:${c.versiculo||'—'}`,line('📍 Localidade',c.localidade),line('📅 Data',datePt(c.data))];const blocks=[['regencia','🎵 *REGÊNCIA*'],['instrumentos','🎻 *INSTRUMENTOS*'],['cargos','👥 *MINISTÉRIO / CARGOS*'],['hinos','🎶 *HINOS ENSAIADOS*']];for(const [kind,title]of blocks){lines.push('',title);if(!state[kind].length)lines.push('• Nenhum registro');state[kind].forEach((it,i)=>lines.push('✅ '+(kind==='regencia'?`${i+1}º ${it.irmao} — ${it.localidade} — ${it.cargo}`:kind==='hinos'?`Hino ${it.nome}`:`${it.nome}: ${it.qtd}`)))}lines.push('','📊 *TOTAL GERAL*');state.cargos.forEach(it=>lines.push(`• ${it.nome}: *${it.qtd}*`));lines.push(`👥 *Total Cargos / Ministérios: ${num('cargos')}*`,`🎺 *Total de Músicos: ${num('instrumentos')}*`,`🎶 *Total de Hinos: ${state.hinos.length}*`,'','✅ _Relatório de Contagem CCB_');return lines.join('\n')}
$('whatsapp').onclick=()=>{window.open('https://wa.me/?text='+encodeURIComponent(whatsappReport()),'_blank','noopener');notice('💬 Mensagem preparada com emojis e totais para WhatsApp.')};
render();
