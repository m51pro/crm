import fs from 'fs';
import fetch from 'node-fetch';

async function run() {
  try {
    const content = fs.readFileSync('temp_contract.html', 'utf8');
    const title = 'Договор Гб (Автоимпорт)';

    // Умная замена данных на переменные Handlebars
    const templateHtml = content
      .replace(/ГБ193701/g, '{{doc_number}}')
      .replace(/31\.12\.2025/g, '{{deal_start}}')
      .replace(/02\.01\.2026/g, '{{deal_end}}')
      .replace(/27 октября 2025 г\./g, '{{doc_date}}')
      .replace(/Попов Алексей Юрьевич/g, '{{client_name}}')
      .replace(/3\/1/g, '{{cottage_name}}')
      .replace(/77000 руб\. \(семьдесят семь тысяч рублей 00 копеек\)/g, '{{doc_amount}} руб. ({{doc_amount_words}})')
      .replace(/77000/g, '{{doc_amount}}')
      .replace(/0 руб\. \(ноль рублей 00 копеек\)/g, '{{doc_balance_words}}')
      .replace(/5105013870/g, '{{my_inn}}')
      .replace(/1215100000158/g, '{{my_ogrn}}')
      .replace(/5004 663288/g, '{{client_passport}}');

    const response = await fetch('http://localhost:3000/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        html_content: templateHtml,
        settings: {
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 10
        }
      })
    });

    const result = await response.json();
    console.log('SUCCESS:', JSON.stringify(result));
    
    // Удаляем временные файлы
    if (fs.existsSync('temp_contract.html')) fs.unlinkSync('temp_contract.html');
    if (fs.existsSync('import_template.js')) fs.unlinkSync('import_template.js');

  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

run();
