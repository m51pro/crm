import fs from 'fs';
import mm from 'mammoth';
// Используем стандартный http/https так как node-fetch в ESM через -e глючит
import http from 'http';

async function postTemplate(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/templates',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function run() {
  const docPath = 'f:\\Kris\\Иностранный рок\\дианка\\zip (2)\\Пример\\Договор Гб.docx';
  
  try {
    console.log('--- Начинаю импорт договора ---');
    
    console.log('1. Конвертация DOCX -> HTML...');
    const result = await mm.convertToHtml({ path: docPath });
    let html = result.value;

    console.log('2. Разметка переменных Handlebars...');
    // Базовые замены
    html = html
      .replace(/ГБ193701/g, '{{doc_number}}')
      .replace(/31\.12\.2025/g, '{{deal_start}}')
      .replace(/02\.01\.2026/g, '{{deal_end}}')
      .replace(/27 октября 2025 г\./g, '{{doc_date}}')
      .replace(/Попов Алексей Юрьевич/g, '{{client_name}}')
      .replace(/3\/1/g, '{{cottage_name}}')
      .replace(/5105013870/g, '{{my_inn}}')
      .replace(/1215100000158/g, '{{my_ogrn}}')
      .replace(/5004 663288/g, '{{client_passport}}');

    // Сложные замены сумм
    html = html.replace(/77000 руб\. \(семьдесят семь тысяч рублей 00 копеек\)/g, '{{doc_amount}} руб. ({{doc_amount_words}})');
    html = html.replace(/77000/g, '{{doc_amount}}');
    html = html.replace(/0 руб\. \(ноль рублей 00 копеек\)/g, '{{doc_balance_words}}');

    console.log('3. Сохранение в базу данных...');
    const resData = await postTemplate({
      title: 'Договор Гб (Автоимпорт)',
      html_content: html,
      settings: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 10
      }
    });

    if (resData.success) {
      console.log('✅ УСПЕХ: Шаблон создан!');
    } else {
      console.log('❌ ОШИБКА БАЗЫ:', resData.error);
    }

  } catch (e) {
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', e.message);
  } finally {
    console.log('--- Процесс завершен ---');
  }
}

run();
