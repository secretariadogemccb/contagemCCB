# CONTAGEM CCB – Atualização responsiva

## Publicar no GitHub Pages
1. Extraia o ZIP.
2. Envie o conteúdo da pasta para a **raiz** do repositório (o arquivo `index.html` deve ficar na raiz).
3. Em Settings > Pages, selecione `main` e `/(root)`.
4. No iPhone, atualize a página. Se estiver vendo a versão anterior, limpe o cache do site.

## Recursos
- Interface baseada no layout fornecido, fontes e controles maiores, CSS responsivo.
- Persistência em `localStorage`: os dados continuam após atualizar/fechar a página, no mesmo navegador; só **Novo Evento** remove todos os dados mediante confirmação. **Limpar** limpa apenas os campos iniciais.
- Listas com edição/exclusão, total de músicos, cargos/ministérios e hinos.
- PDF A4 gerado **offline** com o modelo recebido como fundo, conteúdo inserido sobre a página; registros que não couberem são incluídos em folhas de continuação.
- Compartilhamento nativo do PDF em navegadores mobile que aceitem `navigator.share({files})`; caso contrário, download do PDF para compartilhar manualmente.
- Word `.docx` com logo oficial, títulos cinza, conteúdo editável.
- Mensagem WhatsApp com emojis, blocos e totais.
- Pasta `backend-java21` é opcional; **GitHub Pages não executa Java**.

## Aviso
O modelo PDF enviado é um formulário com áreas vazias. Os dados são sobrepostos nesses campos; quando um bloco contém muitas linhas, o excedente aparece em páginas adicionais. Verifique a visualização final antes de encaminhar.
