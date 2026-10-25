'use strict';
/* PDF A4 offline: usa como fundo a página EXATA do modelo PDF enviado (renderizada sem alterações);
   insere dados dinâmicos, com quebra de página e seções identificadas. Sem bibliotecas/CDN. */
async function createContagemPdf(state,datePt) {
  const response = await fetch('assets/modelo-pdf.jpg');
  if (!response.ok) throw Error('Modelo PDF não encontrado.');
  const background = new Uint8Array(await response.arrayBuffer());
  const W=597.276, H=843.89, ink='0.28 0.26 0.26', gray='0.43 0.39 0.38';
  const cp1252 = {'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
  function byteArray(s){let a=[];for (const ch of String(s)) {let code=ch.codePointAt(0);a.push(code<256?code:(cp1252[ch]??63))}return new Uint8Array(a)}
  function clean(s){return String(s??'').replace(/[\r\n]+/g,' ').replace(/[\t]+/g,' ').trim()}
  function escaped(s){return clean(s).replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)')}
  function text(s,x,top,size=10,bold=false,color=ink){return `BT /${bold?'F2':'F1'} ${size} Tf ${color} rg 1 0 0 1 ${x} ${H-top} Tm (${escaped(s)}) Tj ET\n`}
  function line(x1,y1,x2,y2,rgb=gray){return `${rgb} RG 0.8 w ${x1} ${H-y1} m ${x2} ${H-y2} l S\n`}
  function roundedRect(x,top,w,h,r=8,color=gray){let y=H-top-h,k=.552285;
    return `${color} rg ${x+r} ${y} m ${x+w-r} ${y} l ${x+w-r+r*k} ${y} ${x+w} ${y+r-r*k} ${x+w} ${y+r} c ${x+w} ${y+h-r} l ${x+w} ${y+h-r+r*k} ${x+w-r+r*k} ${y+h} ${x+w-r} ${y+h} c ${x+r} ${y+h} l ${x+r-r*k} ${y+h} ${x} ${y+h-r+r*k} ${x} ${y+h-r} c ${x} ${y+r} l ${x} ${y+r-r*k} ${x+r-r*k} ${y} ${x+r} ${y} c f\n`}
  function chunksWrap(s,len=97){const out=[];for(const paragraph of String(s||'—').split('\n')){let current='';for(const word of paragraph.split(/\s+/)){if(!word)continue;if((current+' '+word).length>len && current){out.push(current);current=''}if(word.length>len){if(current){out.push(current);current=''}for(let i=0;i<word.length;i+=len)out.push(word.slice(i,i+len))}else current+=(current?' ':'')+word}if(current)out.push(current)}return out.length?out:['—']}
  const c=state.campos||{};
  const sectionDefs=[
    ['Dados Iniciais',[
      `Santo Serviço: ${c.servico||'—'}`,`Atendimento: ${c.atendimento||'—'}`,
      `Palavra (Livro): ${c.livro||'—'}   Capítulo: ${c.capitulo||'—'}   Versículo: ${c.versiculo||'—'}`,
      `Localidade: ${c.localidade||'—'}`,`Data: ${datePt(c.data)}`]],
    ['Regência',state.regencia.length?state.regencia.map((r,i)=>`${i+1}º ${r.irmao} - ${r.localidade} - ${r.cargo}`):['—']],
    ['Instrumentos',state.instrumentos.length?state.instrumentos.map(r=>`${r.nome} - ${r.qtd}`):['—']],
    ['Ministério / Cargos',state.cargos.length?state.cargos.map(r=>`${r.nome} - ${r.qtd}`):['—']],
    ['Hinos Ensaiados',state.hinos.length?state.hinos.map(r=>`Hino ${r.nome}`):['—']],
    ['Total Geral',[
      ...state.cargos.map(r=>`${r.nome}: ${r.qtd}`),
      `Total de Músicos: ${state.instrumentos.reduce((s,r)=>s+(Number(r.qtd)||0),0)}`,
      `Cargos / Ministérios: ${state.cargos.reduce((s,r)=>s+(Number(r.qtd)||0),0)}`,
      `Hinos Ensaiados: ${state.hinos.length}`]]
  ];
  const pages=[];let stream='',y=123;
  function beginPage(){stream=`q ${W} 0 0 ${H} 0 0 cm /Bg Do Q\n`+line(37,105,560,105);y=123}
  function pageEnd(){pages.push(stream)}
  beginPage();
  sectionDefs.forEach(([label,values],idx)=>{
    let wrapped=[];for(const v of values)wrapped.push(...chunksWrap(v,99));
    const blockH=28+wrapped.length*13.8+12;
    if(y+Math.min(blockH,110)>795){pageEnd();beginPage()}
    const headingW=Math.max(137,Math.min(210,85+label.length*5));
    function heading(continuation){stream+=roundedRect(37,y,headingW,19,9);stream+=text(label+(continuation?' (cont.)':''),49,y+13.4,10.3,true,'1 1 1');y+=27}
    heading(false);
    wrapped.forEach((v,i)=>{
      if(y+17>795){pageEnd();beginPage();heading(true)}
      stream+=text(v,44,y+9,10.1,idx===5&&i>=wrapped.length-3);y+=14.3;
    });
    y+=14;
  });
  pageEnd();
  const objects=[null];const add=v=>(objects.push(v),objects.length-1);
  const catalog=add('');const pagesRoot=add('');
  const regular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const bg=add({binary:background,dict:'/Type /XObject /Subtype /Image /Width 1494 /Height 2110 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode'});
  const pageIds=[];
  pages.forEach((txt,index)=>{
    txt+=text(`CONTAGEM CCB • ${index+1}/${pages.length}`,450,819,8,false,'0.5 0.5 0.5');
    const st=add({binary:byteArray(txt),dict:''});
    pageIds.push(add(`<< /Type /Page /Parent ${pagesRoot} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> /XObject << /Bg ${bg} 0 R >> >> /Contents ${st} 0 R >>`));
  });
  objects[catalog]=`<< /Type /Catalog /Pages ${pagesRoot} 0 R >>`;
  objects[pagesRoot]=`<< /Type /Pages /Kids [${pageIds.map(i=>i+' 0 R').join(' ')}] /Count ${pageIds.length} >>`;
  const all=[];const offsets=[0];let length=0;
  function push(s){const bytes=(typeof s==='string')?byteArray(s):s;all.push(bytes);length+=bytes.length}
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  objects.forEach((obj,i)=>{if(!i)return;offsets[i]=length;push(`${i} 0 obj\n`);if(typeof obj==='string')push(obj+'\n');else{push(`<< ${obj.dict} /Length ${obj.binary.length} >>\nstream\n`);push(obj.binary);push('\nendstream\n')}push('endobj\n')});
  const xref=length;push(`xref\n0 ${objects.length}\n0000000000 65535 f \n`);
  for(let i=1;i<objects.length;i++)push(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  push(`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(all,{type:'application/pdf'});
}
