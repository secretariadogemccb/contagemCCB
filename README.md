# CONTAGEM CCB

Aplicativo responsivo de contagem para eventos da Congregação Cristã no Brasil, criado a partir do layout enviado.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **todos os arquivos desta pasta para a raiz do repositório**, especialmente `index.html`, `style.css`, `app.js` e `assets/`.
3. Em **Settings > Pages**, escolha **Deploy from a branch**, branch `main` e pasta `/(root)`; salve.
4. Abra a URL disponibilizada pelo GitHub Pages.

Não são necessários Maven, MySQL ou servidor para usar a versão GitHub Pages. O GitHub Pages **não executa Java no servidor**: o aplicativo disponível ao público usa HTML, CSS e JavaScript.

## Dados persistidos

Todos os campos e itens são armazenados automaticamente em `localStorage` do navegador, por origem/domínio. Recarregar a página não apaga o evento. **Novo Evento**, após confirmação, apaga os dados do evento; os botões Limpar e Limpar Campos limpam apenas os dados iniciais. O armazenamento é local ao dispositivo/navegador; não sincroniza entre celulares/computadores e pode ser excluído se o usuário limpar os dados do navegador ou usar navegação privativa. Não é um banco de dados central nem backup seguro.

## Recursos

- Dados Iniciais: Santo Serviço, Atendimento, Palavra, Capítulo, Versículo, Localidade e Data.
- Regência: cadastro, edição e exclusão de irmão, localidade e cargo.
- Instrumentos: nome e quantidade, com edição e exclusão.
- Ministério/Cargos: nome, quantidade, edição, exclusão e total geral automático.
- Hinos Ensaiados: cadastro, edição e exclusão.
- PDF: abre uma versão diagramada para impressão; na caixa do navegador selecione **Salvar como PDF**. O PDF é **inspirado na estrutura e seções** do modelo fornecido, não um preenchimento do PDF original.
- Word: download de arquivo `.doc` baseado em HTML, compatível com Word (não é `.docx`).
- WhatsApp: prepara a mensagem de texto no WhatsApp Web ou aplicativo; o envio exige confirmação do usuário.

## Backend Java 21 (opcional, separado do GitHub Pages)

Dentro da pasta `backend-java21`, execute `EXECUTAR_WINDOWS.bat` com JDK 21 instalado. Abra `http://localhost:8080` no navegador. O servidor fornece os arquivos estáticos e uma API REST experimental: `GET /api/evento` lê um JSON salvo no servidor, `POST /api/evento` grava um JSON, `DELETE /api/evento` exclui. O frontend entregue usa `localStorage` e **não chama essa API automaticamente**. Para salvar dados num servidor, sincronização multiusuário e autenticação, seria necessária uma integração adicional com a API e hospedagem de backend apropriada. A API de exemplo escuta apenas em `127.0.0.1` e não deve ser exposta publicamente sem autenticação/validação.

## Arquivos

- `index.html`: interface
- `style.css`: aparência e responsividade
- `app.js`: cadastro, persistência e exportação
- `assets/`: imagens fornecidas
- `Modelo-Contador-CCB.pdf`: PDF original de referência
- `backend-java21/`: servidor Java 21 opcional

## Observações

O total de pessoas soma as quantidades de Ministério / Cargos. O total de instrumentos soma as quantidades de instrumentos; regentes e hinos são listados sem serem contabilizados como pessoas adicionais. Não cadastre uma pessoa em mais de uma categoria se desejar um total de pessoas únicas.

## Atualização — Total de Hinos e logo oficial
- O painel, o PDF, a mensagem de WhatsApp e o Word incluem **Total de Hinos** (quantidade de hinos cadastrados).
- A antiga indicação **Total de pessoas** foi substituída por **Total Cargos / Ministérios**.
- Os relatórios PDF e Word usam a logo CCB recebida no anexo mais recente.
- O Word agora é exportado como **.docx**, com a imagem inserida diretamente no documento (não depende de rede depois de baixado).
