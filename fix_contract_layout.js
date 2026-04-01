import http from 'http';

async function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', (e) => reject(e));
    if (data) req.write(postData);
    req.end();
  });
}

async function fix() {
  try {
    console.log('Поиск существующего шаблона...');
    const list = await request('GET', '/api/templates');
    const template = list.data.find(t => t.title.includes('Договор Гб'));
    
    if (!template) {
      console.log('Шаблон не найден');
      return;
    }

    const fullTemplate = await request('GET', `/api/templates/${template.id}`);
    let html = fullTemplate.data.html_content;

    // 1. Исправляем основную разметку, если там были опечатки
    html = html.replace(/{{my_inn}} Дата рождения/g, 'ИНН {{my_inn}}</td><td>Дата рождения');
    
    // 2. Полностью переделываем секцию реквизитов (последний блок)
    const tableHtml = `
<div style="margin-top: 30px; border-top: 1px solid #eee; pt-10">
  <h3 style="text-align: center; font-size: 14px; margin-bottom: 20px;">6. Адреса и реквизиты сторон</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
    <tr>
      <td style="width: 50%; vertical-align: top; padding-right: 20px;">
        <strong>Сторона-1</strong><br/>
        <strong>{{my_name}}</strong><br/><br/>
        ИНН: {{my_inn}}<br/>
        КПП: {{my_kpp}}<br/>
        ОГРН: {{my_ogrn}}<br/>
        Юр. адрес: {{my_address}}<br/>
        Почт. адрес: {{my_postal}}<br/>
        Эл. почта: {{my_email}}<br/>
        Тел: {{my_phone}}<br/><br/>
        {{my_bank}}<br/>
        Р/счет: {{my_account}}<br/>
        БИК: {{my_bik}}<br/>
        К/счет: {{my_corr}}
      </td>
      <td style="width: 50%; vertical-align: top; padding-left: 20px;">
        <strong>Сторона-2</strong><br/>
        <strong>{{client_name}}</strong><br/><br/>
        Дата рождения: {{client_birth_date}}<br/>
        Паспорт: {{client_passport}}<br/>
        Выдан: {{client_passport_date}} {{client_passport_issued_by}}<br/>
        Адрес: {{client_address}}<br/>
        Эл. почта: {{client_email}}<br/>
        Телефон: {{client_phone}}
      </td>
    </tr>
    <tr>
      <td style="padding-top: 40px;">
        {{my_signatory_role}} /________________/
      </td>
      <td style="padding-top: 40px;">
        {{client_name}} /________________/
      </td>
    </tr>
  </table>
</div>`;

    // Заменяем всё после 5-го пункта на нашу красивую таблицу
    const splitPoint = html.indexOf('6.Адреса и реквизиты сторон') !== -1 
      ? html.indexOf('6.Адреса и реквизиты сторон') 
      : html.indexOf('Адреса и реквизиты сторон');
      
    if (splitPoint !== -1) {
       html = html.substring(0, splitPoint - 40) + tableHtml;
    } else {
       html += tableHtml;
    }

    console.log('Обновление шаблона в базе...');
    await request('POST', '/api/templates', {
      id: template.id,
      title: 'Договор Гб (Исправленный)',
      html_content: html,
      settings: fullTemplate.data.settings
    });

    console.log('✅ ИСПРАВЛЕНО! Обновите страницу в браузере.');

  } catch (e) {
    console.error('Ошибка:', e.message);
  }
}

fix();
