'use strict';
/* DOCX OOXML standalone ZIP exporter for GitHub Pages (no CDN or backend needed). */
async function downloadContagemDocx(state, datePt) {
  const encoder = new TextEncoder();
  const esc = s => String(s ?? '').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
  const para=(v,style='')=>`<w:p>${style?`<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`:''}<w:r><w:t xml:space="preserve">${esc(v)}</w:t></w:r></w:p>`;
  const heading=v=>para(v,'Heading2');
  const data=state.campos;
  const lines=[heading('Dados Iniciais'),para(`Santo Serviço: ${data.servico||'—'}`),para(`Atendimento: ${data.atendimento||'—'}`),para(`Palavra (Livro): ${data.livro||'—'} | Capítulo: ${data.capitulo||'—'} | Versículo: ${data.versiculo||'—'}`),para(`Localidade: ${data.localidade||'—'}`),para(`Data: ${datePt(data.data)}`)];
  const definitions=[['regencia','Regência'],['instrumentos','Instrumentos'],['cargos','Ministério / Cargos'],['hinos','Hinos Ensaiados']];
  for(const [kind,name] of definitions){lines.push(heading(name));if(!state[kind].length)lines.push(para('—'));for(let i=0;i<state[kind].length;i++){const it=state[kind][i];lines.push(para(kind==='regencia'?`${i+1}º ${it.irmao} - ${it.localidade} - ${it.cargo}`:kind==='hinos'?`Hino - ${it.nome}`:`${it.nome} - ${it.qtd}`))}}
  const totalCargos=state.cargos.reduce((n,it)=>n+Number(it.qtd||0),0);
  const totalInstrumentos=state.instrumentos.reduce((n,it)=>n+Number(it.qtd||0),0);
  lines.push(heading('Total Geral'));
  for(const it of state.cargos)lines.push(para(`${it.nome}: ${it.qtd}`));
  lines.push(para(`Total Cargos / Ministérios: ${totalCargos}`),para(`Total de Músicos: ${totalInstrumentos}`),para(`Hinos Ensaiados: ${state.hinos.length}`));
  const logoResponse=await fetch(new URL('assets/logo-ccb.png',location.href));
  if(!logoResponse.ok)throw new Error('Logo oficial não encontrada.');
  const logo=new Uint8Array(await logoResponse.arrayBuffer());
  const headerRule=`<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="18" w:color="777777"/></w:pBdr></w:pPr></w:p>`;
  const imageDrawing=`<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="3200000" cy="1675000"/><wp:docPr id="1" name="Logo CCB"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="Logo CCB"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="3200000" cy="1675000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${imageDrawing}${headerRule}${lines.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="1000" w:bottom="900" w:left="1000"/></w:sectPr></w:body></w:document>`;
  const styles=`<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:shd w:fill="777777" w:val="clear"/><w:spacing w:before="300" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="26"/></w:rPr></w:style></w:styles>`;
  const entries=[
    ['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`],
    ['_rels/.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
    ['word/document.xml',documentXml],['word/styles.xml',styles],
    ['word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo-ccb.png"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['word/media/logo-ccb.png',logo]
  ];
  // ZIP file, stored entries. Word can read uncompressed OOXML directly.
  const le16=(a,o,v)=>{a[o]=v&255;a[o+1]=(v>>>8)&255},le32=(a,o,v)=>{le16(a,o,v);le16(a,o+2,v>>>16)};
  const crcTable=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);crcTable[i]=c>>>0}
  function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  const parts=[], central=[];let offset=0;
  for(const [name,content] of entries){const nb=encoder.encode(name), b=typeof content==='string'?encoder.encode(content):content,crc=crc32(b);const h=new Uint8Array(30+nb.length);le32(h,0,0x04034b50);le16(h,4,20);le16(h,6,0x0800);le32(h,14,crc);le32(h,18,b.length);le32(h,22,b.length);le16(h,26,nb.length);h.set(nb,30);parts.push(h,b);
   const cd=new Uint8Array(46+nb.length);le32(cd,0,0x02014b50);le16(cd,4,20);le16(cd,6,20);le16(cd,8,0x0800);le32(cd,16,crc);le32(cd,20,b.length);le32(cd,24,b.length);le16(cd,28,nb.length);le32(cd,42,offset);cd.set(nb,46);central.push(cd);offset+=h.length+b.length}
  const centralLength=central.reduce((n,a)=>n+a.length,0);const end=new Uint8Array(22);le32(end,0,0x06054b50);le16(end,8,entries.length);le16(end,10,entries.length);le32(end,12,centralLength);le32(end,16,offset);
  const blob=new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='CONTAGEM_CCB.docx';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1500);
}
