// Page Object do login da Iterasys (modal aberto pelo "Entrar" do cabeçalho)
const { aguardarRespostaApi } = require('../support/respostaApi');

class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // Cabeçalho da página principal (fora do modal)
    this.linkEntrar = this.opcaoDoCabecalho(/^Entrar$/);
    this.linkCadastrar = this.opcaoDoCabecalho(/^Cadastrar-se$/);

    // Modal de login
    this.campoEmail = page.locator('#signin-email');
    this.campoSenha = page.locator('#signin-password');
    this.botaoEntrar = page.locator('#submitLogin');
    this.mensagemCredenciaisInvalidas = page.getByText(
      'Confira seu e-mail e sua senha, por favor.'
    );

    // Área logada (não usar o nome da usuária: o repositório é público).
    // Aponta para o texto do botão, que tem área visível em todos os navegadores;
    // o <a> que envolve o botão é considerado oculto pelo Firefox e pelo WebKit.
    this.linkVisitProfile = page
      .locator('a[href="/profile"] span:visible', { hasText: 'Visit profile' })
      .first();

    // Aviso (toast) exibido quando o cadastro está desabilitado
    this.toastTitulo = page.locator('.iziToast-title');
    this.toastMensagem = page.locator('.iziToast-message');
  }

  /** Opção visível do cabeçalho pelo texto (ignora duplicatas ocultas do menu mobile). */
  opcaoDoCabecalho(texto) {
    return this.page
      .locator('.lw-topbar-option-link-lbl:visible', { hasText: texto })
      .first();
  }

  async acessarPaginaDeCursos() {
    await this.page.goto('/');
  }

  async abrirModal() {
    await this.linkEntrar.click();
    await this.campoEmail.waitFor({ state: 'visible' });
  }

  async fazerLogin(email, senha) {
    await this.campoEmail.fill(email);
    await this.campoSenha.fill(senha);
    await this.botaoEntrar.click();
  }

  /**
   * Igual a fazerLogin(), mas devolve { status, corpo } da API (/api/signin).
   * O corpo é lido assim que a resposta chega, antes da navegação para /start.
   */
  async fazerLoginCapturandoResposta(email, senha) {
    await this.campoEmail.fill(email);
    await this.campoSenha.fill(senha);
    const [resposta] = await Promise.all([
      aguardarRespostaApi(this.page, '/api/signin'),
      this.botaoEntrar.click(),
    ]);
    return resposta;
  }

  async irParaCadastro() {
    await this.linkCadastrar.click();
  }
}

module.exports = { LoginPage };
