const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  const url =
    'https://www.jusbrasil.com.br/legislacao/104108/lei-de-beneficios-da-previdencia-social-lei-8213-91';

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Espera o conteúdo dinâmico carregar
    await new Promise((resolve) => setTimeout(resolve, 7000));

    // Salva o HTML completo
    const html = await page.content();
    fs.writeFileSync('pagina.html', html, 'utf8');
    console.log('✅ HTML completo salvo como pagina.html');

    const $ = cheerio.load(html);
    const result = [];

    $('article.legislacao_LegislationPage-article__mCmS3 p').each((i, el) => {
      const classList = $(el).attr('class') || '';

      // ❌ Ignora parágrafos com classe "revoked"
      if (classList.includes('law-item_LawItem--revoked__4jsRW')) return;

      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const article = (text.match(/Art\.\s*\d+º?/) || [null])[0];
      const outerHTML = $.html(el).trim();

      result.push({
        index: i + 1,
        article,
        text,
        html: outerHTML,
      });
    });

    fs.writeFileSync('leis.json', JSON.stringify(result, null, 2), 'utf8');
    console.log(`✅ ${result.length} leis salvas (sem revogadas) em leis.json`);

    await browser.close();
  } catch (err) {
    console.error('❌ Erro ao acessar a página:', err.message);
  }
})();
