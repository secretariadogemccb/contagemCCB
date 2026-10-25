# CONTAGEM CCB — Redesign V5

Projeto estático **HTML + CSS + JavaScript** pronto para GitHub Pages. Backend Java 21 opcional na pasta `backend-java21`.

## Publicar no GitHub Pages

1. Extraia o ZIP.
2. Envie **o conteúdo da pasta** `CONTAGEM_CCB_REDESIGN_V5` para a raiz do repositório (o `index.html` deve ficar na raiz).
3. Em **Settings → Pages**, selecione **Deploy from a branch**, `main`, `/ (root)`.
4. Aguarde o GitHub Pages atualizar. Se a versão antiga permanecer, recarregue sem cache.

## Interface

- Layout refeito conforme a imagem de referência, com seções alternadas em tons cinza/rosa e branco.
- Campos dimensionados para celulares, inclusive o campo de data no Safari do iPhone.
- Regência, instrumentos, cargos/ministérios e hinos: adicionar, editar, excluir.
- Contagem automática de músicos, cargos/ministérios e hinos.
- **Persistência:** dados gravados em `localStorage` (`contagem-ccb-v1`, a mesma chave das versões anteriores), preservados após atualização da página. **Novo Evento** pergunta antes de apagar.
- O botão **Limpar** limpa apenas campos iniciais; não exclui os registros cadastrados.
- WhatsApp com mensagem formatada e emojis.

## Relatórios

- **PDF:** arquivo A4 construído no navegador utilizando a renderização do **modelo PDF mais recente enviado** (`MODELO_ORIGINAL_ENVIADO.pdf`) como fundo, preservando a logo original, tarja superior e clave de sol. As seções, valores e totalizadores são sobrepostos dinamicamente; registros extensos continuam nas páginas seguintes.
- **Word (.docx):** documento editável A4 baseado no mesmo cabeçalho e organização de seções, com logo oficial e clave incorporadas ao arquivo. É uma reconstrução editável do modelo, não uma cópia pixel a pixel.
- No celular, o botão **PDF** abre o menu nativo de compartilhamento se suportado (`navigator.canShare`); caso contrário, faz download. Para WhatsApp, compartilhe o arquivo pelo menu do smartphone.
- Ambos os formatos são gerados localmente sem bibliotecas externas, sem internet depois do carregamento da página.

## Java 21

O GitHub Pages **não executa Java**. O servidor Java 21 incluído em `backend-java21` é opcional, destinado à execução fora do GitHub Pages e não é necessário ao sistema web estático.

## Arquivos

`index.html`, `style.css`, `app.js`, `pdf-export.js`, `docx-export.js`, `assets/`, `MODELO_ORIGINAL_ENVIADO.pdf`, `.nojekyll`, `backend-java21/`.
