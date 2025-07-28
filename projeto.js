const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/leis', (req, res) => {
  try {
    const data = fs.readFileSync('leis.json', 'utf8');
    const leis = JSON.parse(data);

    const filtrado = leis.filter(
      (item) =>
        item.text &&
        !item.text.startsWith('(Vide') &&
        !item.text.startsWith('(Revogado')
    );

    res.json(filtrado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao ler leis.json' });
  }
});

app.get('/atualizar', async (req, res) => {
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

    await new Promise((resolve) => setTimeout(resolve, 7000));

    const html = await page.content();
    fs.writeFileSync('pagina.html', html, 'utf8');
    console.log('✅ HTML completo salvo como pagina.html');

    const $ = cheerio.load(html);
    const result = [];

    $('article.legislacao_LegislationPage-article__mCmS3 p').each((i, el) => {
      const classList = $(el).attr('class') || '';
      if (classList.includes('law-item_LawItem--revoked__4jsRW')) return;

      const text = $(el).text().trim().replace(/\s+/g, ' ');

      if (text.startsWith('(Vide') || text.startsWith('(Revogado')) return;

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

    res.json({ message: 'Leis atualizadas com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao acessar a página:', err.message);
    res.status(500).json({ erro: 'Erro ao atualizar leis' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
