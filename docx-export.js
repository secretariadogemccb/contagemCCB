'use strict';
/* DOCX editável — modelo A4 baseado no PDF oficial fornecido, sem dependências externas. */
async function createContagemDocx(state,datePt) {
  const encoder=new TextEncoder(),s=state,cam=s.campos||{};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const paragraph=(v,opt={})=>`<w:p><w:pPr>${opt.keep?'<w:keepNext/>':''}<w:spacing w:after="${opt.after??80}" w:before="${opt.before??0}"/>${opt.shade?`<w:shd w:fill="${opt.shade}"/>`:''}${opt.line?'<w:pBdr><w:bottom w:val="single" w:sz="14" w:color="797371"/></w:pBdr>':''}</w:pPr><w:r><w:rPr>${opt.bold?'<w:b/>':''}<w:color w:val="${opt.color||'44403F'}"/><w:sz w:val="${opt.size||21}"/></w:rPr><w:t xml:space="preserve">${esc(v)}</w:t></w:r></w:p>`;
  const heading=v=>paragraph(`  ${v}  `,{shade:'70625F',bold:true,color:'FFFFFF',size:22,before:230,after:110,keep:true});
  const list=(items)=>items.length?items.map(v=>paragraph(v,{after:45})).join(''):paragraph('—');
  const fmt=(k,r,i)=> k==='regencia'?`${i+1}º ${r.irmao} - ${r.localidade} - ${r.cargo}`:k==='hinos'?`Hino ${r.nome}`:`${r.nome} - ${r.qtd}`;
  const body=[heading('Dados Iniciais'),paragraph(`Santo Serviço: ${cam.servico||'—'}`),paragraph(`Atendimento: ${cam.atendimento||'—'}`),paragraph(`Palavra (Livro): ${cam.livro||'—'}  |  Capítulo: ${cam.capitulo||'—'}  |  Versículo: ${cam.versiculo||'—'}`),paragraph(`Localidade: ${cam.localidade||'—'}`),paragraph(`Data: ${datePt(cam.data)}`)];
  for(const [key,title] of [['regencia','Regência'],['instrumentos','Instrumentos'],['cargos','Ministério / Cargos'],['hinos','Hinos Ensaiados']]) {
    body.push(heading(title),list(s[key].map((r,i)=>fmt(key,r,i))));
  }
  const inst=s.instrumentos.reduce((v,r)=>v+(Number(r.qtd)||0),0),cargos=s.cargos.reduce((v,r)=>v+(Number(r.qtd)||0),0);
  body.push(heading('Total Geral'),...s.cargos.map(r=>paragraph(`${r.nome}: ${r.qtd}`)),paragraph(`Total de Músicos: ${inst}`,{bold:true,after:120}),paragraph(`Cargos / Ministérios: ${cargos}`,{bold:true,after:120}),paragraph(`Hinos Ensaiados: ${s.hinos.length}`,{bold:true,after:120}));
  async function asset(url){const r=await fetch(url);if(!r.ok)throw Error('Imagem do documento não encontrada: '+url);return new Uint8Array(await r.arrayBuffer())}
  const [logo,clef]=await Promise.all([asset('assets/logo-ccb.png'),asset('assets/clave-unica.png')]);
  const drawing=(id,rel,name,cx,cy)=>`<w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="${name}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rel}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  const topRule='<w:p><w:pPr><w:shd w:fill="777777"/><w:spacing w:after="150"/></w:pPr><w:r><w:t> </w:t></w:r></w:p>';
  const headerImages=`<w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9250"/></w:tabs><w:spacing w:before="20" w:after="210"/></w:pPr>${drawing(1,'rId1','Logo CCB',1350000,707000)}<w:r><w:tab/></w:r>${drawing(2,'rId2','Clave de Sol',380000,770000)}</w:p>`;
  const rule='<w:p><w:pPr><w:pBdr><w:bottom w:val="double" w:sz="14" w:color="777777"/></w:pBdr><w:spacing w:after="80"/></w:pPr><w:r><w:t> </w:t></w:r></w:p>';
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${topRule}${headerImages}${rule}${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="350" w:right="800" w:bottom="850" w:left="800" w:header="0" w:footer="400"/></w:sectPr></w:body></w:document>`;
  const entries=[
    ['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`],
    ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
    ['word/document.xml',documentXml],
    ['word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo-ccb.png"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/clave-unica.png"/></Relationships>`],
    ['word/media/logo-ccb.png',logo],['word/media/clave-unica.png',clef]
  ];
  /* Zip arquivado (store) com CRC32 nativo JS */
  const le16=(a,o,v)=>{a[o]=v&255;a[o+1]=(v>>>8)&255},le32=(a,o,v)=>{le16(a,o,v);le16(a,o+2,v>>>16)};
  const crcTable=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);crcTable[i]=c>>>0}
  function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  const parts=[],central=[];let offset=0;
  for(const [name,content] of entries){const nb=encoder.encode(name),b=typeof content==='string'?encoder.encode(content):content,crc=crc32(b);const h=new Uint8Array(30+nb.length);le32(h,0,0x04034b50);le16(h,4,20);le16(h,6,0x0800);le32(h,14,crc);le32(h,18,b.length);le32(h,22,b.length);le16(h,26,nb.length);h.set(nb,30);parts.push(h,b);
    const cd=new Uint8Array(46+nb.length);le32(cd,0,0x02014b50);le16(cd,4,20);le16(cd,6,20);le16(cd,8,0x0800);le32(cd,16,crc);le32(cd,20,b.length);le32(cd,24,b.length);le16(cd,28,nb.length);le32(cd,42,offset);cd.set(nb,46);central.push(cd);offset+=h.length+b.length}
  const centralLength=central.reduce((n,a)=>n+a.length,0),end=new Uint8Array(22);le32(end,0,0x06054b50);le16(end,8,entries.length);le16(end,10,entries.length);le32(end,12,centralLength);le32(end,16,offset);
  return new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
async function downloadContagemDocx(state,datePt){const blob=await createContagemDocx(state,datePt),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='CONTAGEM_CCB.docx';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
