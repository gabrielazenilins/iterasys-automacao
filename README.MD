# Automação de testes: login da plataforma Iterasys

Automação com **Playwright + JavaScript** dos casos de teste (CT) e critérios de aceitação (CA) do login da plataforma da Iterasys (https://iterasys.learnworlds.com). Os cenários vêm da matriz de risco da plataforma: os riscos altos viraram casos de teste, e os médios, critérios de aceitação.

Os testes conferem a **tela** e, quando faz sentido, a **resposta da API** que a tela chama, no mesmo teste e sem chamadas extras ao site. Rodam em **Chromium, Firefox e WebKit**.

## Escopo

| ID | O que valida | Automatizado | Resultado |
|---|---|---|---|
| LOGIN_CT_001 | Login com credenciais válidas (tela + status da API) | Sim | Passa |
| LOGIN_CT_002 | Bloqueio com credenciais inválidas, mensagem genérica (tela + API) | Sim | Passa |
| LOGIN_CT_003 | Recuperação de senha e login social | Não | Depende de ler e-mail e de login com Google |
| LOGIN_CT_004 | Login por Apple, Facebook e LinkedIn | Não | Depende de autenticação externa com proteções anti-bot; já falha manualmente |
| LOGIN_CA_001 | Senhas diferentes na redefinição (tela + API) | Sim | Passa |
| LOGIN_CA_002 (tela) | Link de recuperação inválido ou expirado | Sim | **Falha esperada** (defeito, ver abaixo) |
| LOGIN_CA_002 (API) | API rejeita a redefinição com token inválido | Sim | Passa |
| LOGIN_CA_003 | Cadastro de novos usuários desabilitado | Sim | Passa |

## Achados

1. **LOGIN_CA_002: critério parcialmente atendido.** Com um link de recuperação inválido, o formulário de nova senha abre normalmente. Ao confirmar, o sistema impede a troca, mas só mostra "Não encontrado": não informa que o link não é mais válido e não orienta a solicitar uma nova recuperação. O teste está marcado com `test.fail()`: continua "passando" enquanto o defeito existir e passa a falhar quando for corrigido, avisando para remover a marcação.
2. **A API responde HTTP 200 mesmo em falha.** Tanto `/api/signin` quanto `/api/password-reset` sinalizam erro apenas no corpo (`"success": false`). Quem integra precisa olhar o corpo, e não o status.
3. **Mensagens da API em inglês.** A tela traduz a partir do `translation_code` (por exemplo, `not_found` vira "Não encontrado").

## Estrutura

```
├── pages/                      # Page Objects
│   ├── LoginPage.js            # cabeçalho e modal de login
│   └── RecuperacaoSenhaPage.js # formulário aberto pelo link ?pwdrst=
├── support/
│   └── respostaApi.js          # captura a resposta de uma chamada de API
├── tests/
│   ├── login.spec.js           # CT_001 e CT_002
│   └── ca.spec.js              # CA_001, CA_002 e CA_003
├── playwright.config.js
├── .env.example
└── .gitignore
```

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npx playwright install chromium firefox webkit
```

Crie o arquivo `.env` na raiz, copiando o `.env.example`, e preencha com uma conta de teste:

```
USER_EMAIL=
USER_PASSWORD=
BASE_URL=https://iterasys.learnworlds.com
```

Se a senha tiver `#` ou espaço, coloque o valor entre aspas duplas.

| Comando | O que faz |
|---|---|
| `npm test` | Chromium, sem abrir janela |
| `npm run test:headed` | Chromium com o navegador visível |
| `npm run test:firefox` | Firefox |
| `npm run test:webkit` | WebKit |
| `npm run test:all` | Os três navegadores em sequência |
| `npm run test:ui` | Modo interativo do Playwright |

Relatório do último teste: `npx playwright show-report`.

Sem `USER_EMAIL` e `USER_PASSWORD`, os testes de login são ignorados e os demais continuam rodando.
...
[Link da gravação](https://jam.dev/c/44a2d1a9-0561-40b3-9d4e-74638e525f2b)
...
## Decisões de projeto

- **Page Objects.** Seletores e ações ficam em `pages/`; os specs só descrevem o cenário e as verificações.
- **Credenciais fora do código.** E-mail e senha vêm do `.env`, que está no `.gitignore`. Só o `.env.example`, sem valores, vai para o repositório.
- **Um worker, sem paralelismo.** Os testes rodam contra uma plataforma real e usam a mesma conta; rodar um de cada vez evita bloqueio por excesso de requisições e falhas difíceis de explicar.
- **Trace e vídeo desligados.** Poderiam registrar o que é digitado e os cookies da sessão. Fica apenas o screenshot em caso de falha.
- **Nada é alterado no site.** O link de recuperação usa um token inventado, então nenhuma senha é trocada. O teste de cadastro apenas clica em "Cadastrar-se" e confere o aviso; nenhuma conta é criada.
- **API observada pelo navegador.** Os testes capturam a resposta da chamada que a própria página faz, em vez de chamar a API diretamente. Assim cookies e token anti-CSRF ficam por conta do navegador, sem tratar nada sensível no código.
- **Limite no login válido.** Após o login bem-sucedido o navegador navega para `/start` na hora e descarta o corpo da resposta; por isso o CT_001 confere o status da API e comprova o sucesso pela tela.
- **Clique no botão OK da redefinição.** O painel de regras da senha fica por cima do botão e intercepta o clique do mouse; o clique é disparado direto no elemento. Para um usuário real, isso pode ser um problema de usabilidade (a confirmar em diferentes tamanhos de tela).
- **Falha esperada no CA_002 (tela).** O teste está marcado com `test.fail()` por causa do defeito descrito em "Achados". Na lista de resultados ele aparece com ✘ em cada navegador, mas conta como aprovado. Quando o defeito for corrigido, o teste passa a falhar e a marcação deve ser removida.
