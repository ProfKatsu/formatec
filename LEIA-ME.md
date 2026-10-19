# Formação em movimento

Plataforma de formação online para professores da URE Mogi das Cruzes, segundo semestre de 2026. Entrega local preparada para GitHub + Vercel + Supabase. Ainda não publicada nem conectada a um banco real.

## O que está pronto

- Escolha entre Tecnologia e Inovação / Programação e Robótica.
- Aviso inicial sobre a alternativa à formação presencial.
- Restrição explícita de público de Robótica: PEI 9 horas com aulas atribuídas, com declaração obrigatória antes da avaliação.
- Dois PDFs originais integrais, sem alterações, e dois resumos de duas páginas cada; resumos também disponíveis na própria página.
- Cinco questões por formação, correção no servidor e explicações após o envio.
- Identificação por nome, escola e e-mail confirmado por código.
- Histórico por professor, tentativas numeradas por formação e horários de São Paulo.
- Painel exclusivo de katsusuke@prof.educacao.sp.gov.br, com filtro e exportação CSV.
- Registro separado da declaração de realização do procedimento SED.
- Contato do PEC por WhatsApp e aviso de privacidade.

Nenhuma planilha foi copiada, importada ou publicada. Não existe lista pública de professores ou escolas. Os registros são criados somente quando o professor envia uma avaliação. O nome e a escola são autodeclarados; o e-mail é verificado.

## Antes de publicar

1. Orientação SED atualizada em 19/10/2026: EFAPE > Cadastro de Ação Formativa > Ações Vinculadas URE. Tecnologia e Inovação/Programação: subcódigo 1291/2026. Robótica: subcódigo 1292/2026. Em ambas, informar 8 horas de carga horária. O código de Tecnologia informado pelo PEC prevalece sobre o mostrado no PDF original; há aviso ao lado do material. O print de referência foi incluído na seção SED.
2. O PDF original de Tecnologia contém informações de login no slide 11. Foi preservado integralmente, conforme solicitado. Verifique se essas informações podem ficar públicas antes de publicar; se forem credenciais ativas, providencie uma versão apropriada para distribuição. Use repositório privado no GitHub; isso não torna privados os PDFs servidos pelo site.
3. Definir o prazo institucional de guarda dos registros e atualizar a seção Privacidade em `public/app.js`. Não foi presumido um prazo nem uma nota mínima de aprovação.

## Publicação passo a passo

### 1. Preparar o Supabase

Crie um projeto na sua conta do Supabase e guarde as credenciais no gerenciador apropriado. No SQL Editor, execute o conteúdo de `database/setup.sql` uma vez em um projeto novo.

O script cria a tabela de tentativas e uma função transacional que evita duplicações em reenvios da mesma solicitação. Não execute novamente sem verificar as tabelas já existentes.

Em Authentication, habilite o provedor de e-mail e novos cadastros. Os professores usarão códigos enviados por e-mail; não há senha compartilhada. Configure um provedor SMTP para uso real com os professores. O envio padrão do Supabase é voltado a testes e tem restrições de destinatários e volume.

Em Email Templates, configure o modelo Magic Link e o de confirmação de cadastro para exibir um código, usando o HTML abaixo:

```html
<h2>Seu acesso à Formação em movimento</h2>
<p>Digite este código na plataforma:</p>
<p style="font-size:28px;font-weight:bold">{{ .Token }}</p>
<p>Se você não solicitou este acesso, ignore esta mensagem.</p>
```

O aplicativo usa o fluxo `/auth/v1/otp` e verifica o código com `type: email`. Não configure apenas um link de acesso: esta versão pede que o professor digite o código. Mantenha os limites de envio e proteção contra abuso do Supabase adequados ao volume de participantes.

### 2. Enviar ao GitHub

Extraia o ZIP e envie o conteúdo da pasta `plataforma-formacoes` a um repositório privado. O `package.json`, a pasta `public` e a pasta `api` devem estar na raiz do projeto selecionado para a Vercel. Inclua os arquivos ocultos `.gitignore` e `.env.example`. Nunca envie chaves reais ou um arquivo `.env` preenchido.

Os PDFs integrais têm aproximadamente 25,3 MiB e 35,6 MiB. O envio pelo navegador do GitHub aceita até 25 MiB por arquivo; use Git para enviá-los preservando os originais. Crie o repositório privado vazio na sua conta, clone-o no computador, copie o conteúdo desta pasta para o repositório clonado e execute nele:

```text
git add .
git commit -m "Adiciona plataforma de formacoes"
git push
```

Revise os arquivos antes do commit, incluindo a observação sobre o slide 11. Os PDFs estão abaixo do limite de 100 MiB para arquivos enviados por Git. [Documentação do GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

Não use apenas GitHub Pages: este projeto precisa executar a API de correção, autenticação e relatório no servidor.

### 3. Importar na Vercel

Importe o repositório. Selecione Framework Preset **Other**, Build Command **npm run build** e Output Directory **dist**. Use Node.js 22 ou 24. O arquivo `vercel.json` já declara build e pasta de saída. A pasta `api` da raiz contém a função de servidor; não a mova para `public`.

Configure estas variáveis nas configurações de ambiente da Vercel:

| Nome | Valor |
| --- | --- |
| `SUPABASE_URL` | URL HTTPS do seu projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave pública `anon` do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role`, exclusiva do servidor |
| `ADMIN_USER_ID` | UUID da sua conta em Supabase Authentication |

Para o primeiro acesso, caso sua conta ainda não exista em Authentication, coloque temporariamente `00000000-0000-0000-0000-000000000000` em `ADMIN_USER_ID`. Publique, acesse com `katsusuke@prof.educacao.sp.gov.br` e confirme o código recebido. Nesse momento nenhum usuário terá acesso administrativo. Depois, em Authentication > Users, copie o UUID da sua conta, substitua a variável `ADMIN_USER_ID` e faça um novo deploy.

O servidor exige simultaneamente esse UUID e o e-mail exato do administrador. Apenas digitar o endereço no formulário não concede acesso: o código precisa ser validado pelo Supabase. Não há mecanismo de atribuição de administrador disponível para professores.

Configure o Site URL do Supabase com o endereço HTTPS publicado. Faça novo deploy sempre que alterar variáveis. Separe dados de teste e produção quando usar ambientes de preview.

### 4. Conferir antes de divulgar

Faça estes testes com o Supabase e a Vercel configurados:

1. Abra as duas formações e os quatro PDFs.
2. Confirme o recebimento de código no e-mail institucional.
3. Com uma conta de professor, envie uma avaliação, confira os acertos e refaça. O histórico deve mostrar tentativas 1 e 2.
4. Entre com sua conta administrativa. Confira nome, escola, curso, data, horário, acertos e tentativas; teste os filtros e o CSV.
5. Com a conta de professor, abra `#admin`: o relatório deve ser negado.
6. Registre a declaração SED e confira que aparece como autodeclarada.
7. Teste no celular e em um computador conectado à rede de uma escola. Este site não depende do ChatGPT, mas a liberação de Vercel/Supabase depende da política da rede.

## Uso local

Com Node.js 22 ou superior instalado, abra um terminal na pasta do projeto:

```text
npm run dev
```

Acesse http://127.0.0.1:4173. Materiais e páginas são navegáveis sem configuração. A participação e o relatório mostram indisponibilidade até que as quatro variáveis estejam preenchidas. Para testar com um projeto Supabase de desenvolvimento, copie `.env.example` para `.env`, preencha localmente e use:

```text
node --env-file=.env dev.mjs
```

Não abra `index.html` diretamente: os módulos e as rotas precisam do servidor local. Para verificar o código e preparar os arquivos estáticos:

```text
npm test
npm run build
```

## O que significa o relatório

- **Avaliação registrada:** professor declarou ter estudado e enviou as cinco respostas. Não é prova de leitura de cada slide ou certificado oficial.
- **Acertos:** de 0 a 5, corrigidos pelo servidor. Não foi definida nota mínima de aprovação.
- **Tentativa:** sequência por professor (UUID/e-mail confirmado) e componente. Envios repetidos da mesma solicitação não devem aumentar a contagem.
- **Data e hora:** registradas no banco e exibidas em America/Sao_Paulo.
- **SED:** declaração do professor, sem integração ou conferência com a Secretaria Escolar Digital.
- **Diferentes e-mails:** geram identidades distintas. Oriente a usar sempre o mesmo e-mail.

O administrador vê todos os registros, carregados em páginas de 500. O histórico pessoal exibe os 1.000 envios mais recentes. O CSV exporta os registros correspondentes ao filtro atual e neutraliza valores que poderiam ser interpretados como fórmulas em uma planilha.

## Segurança implementada e limites

O gabarito não está nos arquivos públicos; a correção ocorre no servidor. A identidade é verificada no Supabase a cada chamada protegida. O banco usa RLS sem políticas para leitura/escrita por `anon` e `authenticated`; somente a API, com a chave de serviço, acessa os dados. Professores consultam e atualizam somente seus próprios registros. O relatório exige autorização administrativa no servidor.

A sessão dura enquanto o token for válido e fica somente no armazenamento da aba do navegador. Ao expirar, o usuário entra novamente. Não há renovação silenciosa nesta versão. O botão Sair remove o token local.

Os testes automatizados verificam correção, validação e decisões de autorização com respostas simuladas do Supabase. A função SQL, o envio de e-mail, o deploy na Vercel e o fluxo completo com banco real precisam dos testes de publicação acima; não foram executados em produção nesta entrega.

Também foi verificado no navegador um percurso com dados fictícios em ambiente local separado: entrada por código simulado, cinco respostas, resultado de 4/5, histórico, declaração SED e exibição do relatório. O servidor fictício e seus registros não fazem parte deste pacote.

## Atualizar o tutorial da SED

Prefira prints sem dados pessoais, com setas e etapas numeradas, mais um PDF para consulta. Vídeo no YouTube pode complementar; não deve ser o único recurso de orientação. Inclua o título e o código das duas formações e a tela final de confirmação. O print recebido já está em `public/materiais/sed-robotica.png`, na seção `sed()` de `public/app.js`. Os códigos e a carga horária também constam nos resumos e nos cards de orientação. Em futuras atualizações, mantenha clara a distinção entre ação realizada na SED e declaração nesta plataforma.

## Referências de implantação

- [Vercel: repositórios Git](https://vercel.com/docs/git)
- [Vercel: variáveis de ambiente](https://vercel.com/docs/environment-variables)
- [Supabase: acesso por código de e-mail](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase: configuração SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase: segurança por linha](https://supabase.com/docs/guides/database/postgres/row-level-security)
