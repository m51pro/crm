import Handlebars from "handlebars";
import { convert as convertAmountToWords } from "number-to-words-ru";
import { incline } from "lvovich";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { API_URL } from "@/lib/api";

// Highlight missing placeholders with [?]
Handlebars.registerHelper('helperMissing', function() {
  return new Handlebars.SafeString('<span class="bg-yellow-100/50 text-yellow-600 px-1 font-bold rounded">[?]</span>');
});

// Amount to words
Handlebars.registerHelper('sum_words', function(amount: string | number) {
  if (!amount) return "";
  try {
    return convertAmountToWords(amount.toString(), {
      currency: "rub",
      convertNumberToWords: { fractional: false }
    });
  } catch(e) { return amount; }
});

// Format dates
Handlebars.registerHelper('format_date', function(dateStr: string, fmt: string) {
  if (!dateStr) return "";
  try {
    const d = dateStr.includes('.') ? new Date(dateStr.split('.').reverse().join('-')) : new Date(dateStr);
    return format(d, typeof fmt === 'string' ? fmt : 'dd MMMM yyyy', { locale: ru });
  } catch(e) { return dateStr; }
});

// Name Declension
Handlebars.registerHelper('decline_fio', function(fio: string, gcase: string) {
  if (!fio) return "";
  const parsedCase = typeof gcase === 'string' ? gcase : 'genitive';
  try {
    const parts = fio.split(' ');
    // lvovich internal types expect specific case strings
    const validCase = parsedCase as "nominative" | "genitive" | "dative" | "accusative" | "instrumental" | "prepositional";
    if (parts.length >= 2 && parts[1].includes('.')) {
      const surname = incline({ last: parts[0] }, validCase);
      return surname.last + " " + parts.slice(1).join(" ");
    }
    const result = incline({ last: parts[0], first: parts[1], middle: parts[2] }, validCase);
    return [result.last, result.first, result.middle].filter(Boolean).join(' ');
  } catch(e) { return fio; }
});

export const prepareTemplateVariables = (form: Record<string, unknown>, clients: Record<string, unknown>[]) => {
  const clientMatch = (clients.find(c => c.id === form.client_id) || {}) as Record<string, unknown>;
  const client: Record<string, string> = {
    name: String(clientMatch.name || form.client_name || ""),
    phone: String(clientMatch.phone || form.client_phone || ""),
    first_name: String(clientMatch.first_name || ""),
    inn: String(clientMatch.inn || String(clientMatch.client_inn || "")),
    passport: String(clientMatch.passport || ""),
  };
  
  const grossAmount = Number(form.total || form.rent_price || 0);
  const prepayment = Number(form.prepayment || 0);
  const vatRate = 0.05; // 5% НДС (включен в стоимость)
  const vatAmount = grossAmount * (5 / 105);

  const toWords = (num: number) => {
    try {
      return convertAmountToWords(num.toString(), {
        currency: "rub",
        convertNumberToWords: { fractional: false }
      });
    } catch(e) { return num.toString(); }
  };

  const data = {
    // New Flat Variables (as requested)
    doc_number: form.contract_number || "",
    doc_date: format(new Date(), "dd MMMM yyyy", { locale: ru }),
    doc_amount: grossAmount.toString(),
    vat_amount: vatAmount.toFixed(2),
    doc_amount_words: toWords(grossAmount),
    vat_amount_words: toWords(Math.floor(vatAmount)),
    doc_prepayment: prepayment.toString(),
    deal_start: form.checkin_at_date && typeof form.checkin_at_date === "string" ? format(new Date(form.checkin_at_date), "dd.MM.yyyy") : "",
    deal_end: form.checkout_at_date && typeof form.checkout_at_date === "string" ? format(new Date(form.checkout_at_date), "dd.MM.yyyy") : "",
    guest_count: form.guest_count || "1",
    parent_invoice_number: form.parent_invoice || "—",

    // Client Info (Flat)
    client_name: client.name || "",
    client_phone: client.phone || "",
    client_inn: client.inn || "",
    client_kpp: String(clientMatch.kpp || ""),
    client_ogrn: String(clientMatch.ogrn || ""),
    client_address: String(clientMatch.registration_address || ""),
    client_bank: String(clientMatch.bank || ""),
    client_bik: String(clientMatch.bik || ""),
    client_account: String(clientMatch.account || ""),
    client_corr: String(clientMatch.corr || ""),
    client_passport: client.passport || "",
    client_signatory: String(clientMatch.signatory || ""),
    client_basis: String(clientMatch.basis || "Устава"),

    // Company Info
    my_short_name: "Чунга-Чанга",
    my_name: "ООО «Групп-Чунга»",
    my_inn: "2304012345",
    my_kpp: "230401001",
    my_ogrn: "1122304000123",
    my_address: "г. Геленджик, ул. Ленина, д. 1",
    my_postal: "353460",
    my_phone: "+7 (861) 412-34-56",
    my_signatory_role: "Директор",
    my_city: "Геленджик",

    // Legacy / Nested Structure (for compatibility)
    client: {
      full_name: client.name || client.first_name || "",
      phone: client.phone || "",
      inn: client.inn || "",
      passport: client.passport || "",
      birth_date: client.birth_date || "",
      passport_issued_date: client.passport_issued_date || "",
      passport_issued_by: client.passport_issued_by || "",
      registration_address: client.registration_address || "",
    },
    contract: {
      number: form.contract_number || "",
      date: format(new Date(), "dd MMMM yyyy", { locale: ru }),
      checkin: form.checkin_at_date && typeof form.checkin_at_date === "string" ? format(new Date(form.checkin_at_date), "dd.MM.yyyy") : "",
      checkin_time: form.checkin_at_time || "14:00",
      checkout: form.checkout_at_date && typeof form.checkout_at_date === "string" ? format(new Date(form.checkout_at_date), "dd.MM.yyyy") : "",
      checkout_time: form.checkout_at_time || "12:00",
      days: form.guest_count || 1,
      rent_price: form.rent_price || "0",
      prepayment: form.prepayment || "0",
      total_due: (grossAmount - prepayment).toString(),
    },
    property: {
      name: form.property === "chunga_changa" ? "Чунга-Чанга" : form.property === "gb_banya" ? "ГБ Баня" : "Голубая Бухта"
    },
    cottage: {
      name: form.cottage_id || "Не указан",
      capacity: form.guest_count || "0"
    },
    services: {
      sauna_included: form.sauna_included,
      sauna_price: form.sauna_price,
      hot_tub_included: form.hot_tub_included,
      hot_tub_price: form.hot_tub_price
    }
  };

  return data;
};

export const generatePdfFromHtml = async (templateId: string, formContext: Record<string, unknown>, clients: Record<string, unknown>[]) => {
    try {
        const res = await fetch(`${API_URL}/templates/${templateId}`);
        const data = await res.json();
        
        if (!data.success || !data.data) {
           throw new Error("Не удалось загрузить шаблон");
        }

        const templateData = data.data;
        const html = templateData.html_content || "";
        const settings = templateData.settings || {};

        // Strip Tiptap Variable Spans back to {{variable.name}}
        const cleanHtml = html.replace(
           /<span data-type="variable"[^>]*data-id="([^"]+)"[^>]*>.*?<\/span>/g,
           '{{$1}}'
        );

        const compiler = Handlebars.compile(cleanHtml);
        const mappedData = prepareTemplateVariables(formContext, clients);

        // Добавляем изображения в объект данных, чтобы Handlebars мог их вставить
        const dataWithImages = {
          ...mappedData,
          my_stamp: settings.stampBase64 
            ? `<img src="${settings.stampBase64}" style="position: absolute; width: 120px; margin-left: -60px; margin-top: -50px; mix-blend-mode: multiply; transform: rotate(-5deg); z-index: 10;" />` 
            : "",
          my_signature: settings.signatureBase64 
            ? `<img src="${settings.signatureBase64}" style="width: 150px; vertical-align: middle; mix-blend-mode: multiply;" />` 
            : ""
        };

        const processedHtml = compiler(dataWithImages);

        // Отключаем старую печать в углу (теперь она вставляется через {{my_stamp}} в тексте)
        const stampElement = "";

        const fullDocument = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${templateData.title || "Документ"}</title>
              <style>
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.2; box-sizing: border-box; }
                .document-container {
                   padding-top: ${settings.marginTop || 20}mm;
                   padding-bottom: ${settings.marginBottom || 20}mm;
                   padding-left: ${settings.marginLeft || 20}mm;
                   padding-right: ${settings.marginRight || 15}mm;
                   position: relative;
                   min-height: 297mm;
                }
                .prose p { margin: 0 0 0.5em 0; }
                .prose strong { font-weight: bold; }
                .prose h1, .prose h2, .prose h3 { margin: 1em 0 0.5em 0; text-align: center; }
                .prose ul { list-style-type: disc !important; padding-left: 20pt !important; margin: 10px 0 !important; }
                .prose ol { list-style-type: decimal !important; padding-left: 20pt !important; margin: 10px 0 !important; }
                .prose li { display: list-item !important; margin-bottom: 5px !important; }
                .indent-first-line { text-indent: 1.25cm !important; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 1em; table-layout: fixed; }
                table, th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
                hr { border: none; border-top: 1px solid #000; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="document-container">
                 <div class="prose">${processedHtml}</div>
                 ${stampElement}
              </div>
              <script>
                  window.onload = function() {
                      setTimeout(function() {
                          window.print();
                      }, 500);
                  }
              </script>
            </body>
          </html>
        `;

        const blob = new Blob([fullDocument], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");

        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
