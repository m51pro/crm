import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Editor } from '@tiptap/react';
import Handlebars from 'handlebars';
import { incline } from "lvovich";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import * as mammoth from "mammoth";

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Search, 
  User, 
  Building2, 
  FileCheck, 
  Sparkles, 
  Home, 
  Upload, 
  Eye, 
  FileText,
  Save,
  ChevronLeft,
  Settings,
  Image as ImageIcon,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { TiptapEditor } from "./TiptapEditor";
import { API_URL } from '@/lib/api';

interface TemplateBuilderProps {
  onBack: () => void;
  templateId?: string | null;
}

const DEFAULT_CONTENT = `<h2 style="text-align: center">ДОГОВОР АРЕНДЫ № {{doc_number}}</h2>\n<p style="text-align: center">от {{doc_date}}</p>\n<p><strong>ООО Чунга-Чанга</strong> в лице Директора, именуемый «Арендодатель», и <strong>{{client_name}}</strong>, паспорт {{client_passport}}, именуемый «Арендатор», заключили настоящий договор:</p>\n<p><strong>1. ПРЕДМЕТ ДОГОВОРА</strong></p>\n<p>Арендодатель передает Арендатору коттедж <strong>{{cottage_name}}</strong> (база {{property_name}}) с {{deal_start}} по {{deal_end}}.</p>\n<p><strong>2. ОПЛАТА</strong></p>\n<ul>\n<li>Стоимость: {{doc_amount}} руб.</li>\n<li>Предоплата: <span style="background-color: #fef08a"><strong>{{doc_prepayment}}</strong></span> руб.</li>\n</ul>`;

// Mock data to feed into Handlebars for live preview
const MOCK_DATA = {
  doc_number: "2026/04-01",
  doc_date: "1 апреля 2026 г.",
  doc_amount: "45 000",
  doc_amount_words: "Сорок пять тысяч рублей 00 копеек",
  vat_amount: "14 476,19",
  vat_amount_words: "Семь тысяч пятьсот рублей 00 копеек",
  doc_prepayment: "15 000",
  deal_start: "10.05.2026",
  deal_end: "12.05.2026",
  guest_count: "10",
  parent_invoice_number: "СЧ-991",

  client_name: "Иванов Иван Иванович",
  client_phone: "+7 (999) 123-45-67",
  client_inn: "770123456789",
  client_kpp: "770101001",
  client_ogrn: "1027700132195",
  client_address: "г. Москва, ул. Пушкина, д. 10, кв. 45",
  client_bank: "ПАО СБЕРБАНК",
  client_bik: "044525225",
  client_account: "40817810000001234567",
  client_corr: "30101810400000000225",
  client_passport: "45 10 123456, выдан ОВД г. Москвы",
  client_signatory: "Иванов И.И.",
  client_basis: "Устава",

  my_short_name: "ООО «Золото Арктики»",
  my_name: 'Общество с ограниченной ответственностью «Золото Арктики»',
  my_inn: "5105013870",
  my_kpp: "510501001",
  my_ogrn: "1215100000158",
  my_address: "184433, Мурманская область, Печенгский район, г. Заполярный, ул. Ленина, д.1А, помещение 34",
  my_postal: "183038, г. Мурманск, пер. Терский, д. З",
  my_phone: "(815-2) 99-44-21",
  my_signatory_role: "Генеральный директор",
  my_signatory_name: "Сташ Екатерина Александровна",
  my_bank: "МУРМАНСКОЕ ОТДЕЛЕНИЕ N8627 ПАО СБЕРБАНК",
  my_bik: "044705615",
  my_account: "40702810941710000190",
  my_corr: "30101810300000000615",
  my_city: "Мурманск",
  my_fax: "(815-2) 99-49-49",

  property_name: "Голубая Бухта",
  cottage_name: "Фрегат",
  cottage_capacity: "15",
  sauna_included: true,
  sauna_price: "3000",
  sauna_time: "18:00 - 21:00",
  hot_tub_included: false,
  property_address: "г. Тест, ул. Тестовая, 1",

  deal_days: "8",
  checkin_time: "17ч. 00м.",
  checkout_time: "14ч. 00м.",
  doc_remaining: "304 000",
  doc_remaining_words: "Триста четыре тысячи рублей 00 копеек",
  client_email: "client@example.com",

  vat_rate: "5",
  services_count: "1",
  deal_end_full: "29 марта 2026 г.",
  client_name_short: "Иванов И.И.",

  // ДАННЫЕ ДЛЯ ЦИКЛОВ #each
  services_list: [
    { index: 1, name: "Проживание в коттедже Фрегат", qty: 1, unit: "усл", price: "45 000", sum: "45 000" },
    { index: 2, name: "Аренда бани (3 часа)", qty: 1, unit: "шт", price: "3 000", sum: "3 000" },
    { index: 3, name: "Ранний заезд", qty: 1, unit: "усл", price: "5 000", sum: "5 000" }
  ],
  guests_list: [
    { index: 1, fio: "Иванов Иван Иванович", doc: "Паспорт 45 10 123456" },
    { index: 2, fio: "Иванова Анна Сергеевна", doc: "Паспорт 45 10 654321" },
    { index: 3, fio: "Иванов Петр Иванович", doc: "Свид. о рождении I-АЯ 123456" }
  ],
};

const PRESETS = {
  rental_agreement: {
    title: "Договор на проживание (ГБ)",
    html: `
      <h1 style="text-align: center;">ДОГОВОР № <span data-type="variable" data-id="doc_number"></span></h1>
      <div class="flex-spread">
        <span>г. Мурманск</span>
        <span><span data-type="variable" data-id="doc_date"></span>г.</span>
      </div>
      
      <p><strong><span data-type="variable" data-id="my_name"></span></strong>, именуемый в дальнейшем "Исполнитель", с одной стороны, и
      <strong><span data-type="variable" data-id="client_name"></span></strong>, именуемый в дальнейшем "Заказчик", с другой стороны, заключили настоящий договор о нижеследующем:</p>

      <h3>1. ПРЕДМЕТ ДОГОВОРА</h3>
      <p class="indent-paragraph">1.1. Исполнитель обязуется предоставить Заказчику услуги по проживанию в коттедже <strong><span data-type="variable" data-id="cottage_name"></span></strong>,
      расположенном по адресу: <span data-type="variable" data-id="property_address"></span>.</p>
      <p class="indent-paragraph">1.2. Срок проживания: с <span data-type="variable" data-id="deal_start"></span> по <span data-type="variable" data-id="deal_end"></span> 
      (<span data-type="variable" data-id="deal_days"></span> суток).</p>

      <h3>2. СТОИМОСТЬ И ПОРЯДОК РАСЧЕТОВ</h3>
      <p class="indent-paragraph">2.1. Общая стоимость услуг составляет <strong><span data-type="variable" data-id="doc_amount"></span> руб.</strong> 
      (<span data-type="variable" data-id="doc_amount_words"></span>).</p>
      <p class="indent-paragraph">2.2. Сумма внесенной предоплаты: <span data-type="variable" data-id="doc_prepayment"></span> руб.</p>
      <p class="indent-paragraph">2.3. Остаток к оплате при заезде: <strong><span data-type="variable" data-id="doc_remaining"></span> руб.</strong> 
      (<span data-type="variable" data-id="doc_remaining_words"></span>).</p>

      <h3>3. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h3>
    `
  },
  act: {
    title: "Акт об оказании услуг",
    html: `
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 5px;">Акт № {{doc_number}} от {{doc_date}}</h1>
      <hr style="border: 0; border-top: 1px solid #000; margin-bottom: 20px;" />
      
      <p style="margin-bottom: 10px;"><strong>Исполнитель:</strong> {{my_name}}</p>
      <p style="margin-bottom: 20px;"><strong>Заказчик:</strong> {{client_name}}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;" border="1">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; text-align: center; width: 40px;">№</th>
            <th style="padding: 8px; text-align: left;">Наименование работ, услуг</th>
            <th style="padding: 8px; text-align: center; width: 60px;">Кол-во</th>
            <th style="padding: 8px; text-align: center; width: 60px;">Ед.</th>
            <th style="padding: 8px; text-align: right; width: 100px;">Цена</th>
            <th style="padding: 8px; text-align: right; width: 100px;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; text-align: center;">1</td>
            <td style="padding: 8px;">Услуги по временному размещению в коттедже {{cottage_name}} с {{deal_start}} по {{deal_end}}</td>
            <td style="padding: 8px; text-align: center;">1</td>
            <td style="padding: 8px; text-align: center;">усл</td>
            <td style="padding: 8px; text-align: right;">{{doc_amount}}</td>
            <td style="padding: 8px; text-align: right;">{{doc_amount}}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;"><strong>Итого:</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>{{doc_amount}}</strong></td>
          </tr>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;"><strong>Без налога (НДС):</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>-</strong></td>
          </tr>
          <tr>
            <td colspan="5" style="padding: 8px; text-align: right;"><strong>Всего к оплате:</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>{{doc_amount}}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <p style="margin-bottom: 10px;">Всего наименований 1, на сумму {{doc_amount}} руб.</p>
      <p style="margin-bottom: 30px;"><strong>{{doc_amount_words}}</strong></p>
      
      <p style="margin-bottom: 40px; font-size: 12px;">Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <p><strong>ИСПОЛНИТЕЛЬ</strong></p>
            <p style="margin-top: 10px; font-size: 12px;">{{my_signatory_role}} {{my_name}}</p>
            <div style="margin-top: 40px;">
              <span>/ {{my_signatory_role}} /</span>
              <span style="margin-left: 20px;">________________</span>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top;">
            <p><strong>ЗАКАЗЧИК</strong></p>
            <p style="margin-top: 10px; font-size: 12px;">{{client_name}}</p>
            <div style="margin-top: 40px;">
              <span>________________</span>
              <span style="margin-left: 20px;">/ {{client_name}} /</span>
            </div>
          </td>
        </tr>
      </table>
    `
  },
  schet: {
    title: "Счёт на оплату",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 15mm 15mm 15mm 20mm; margin: 0 auto; background: #fff; }
  .bank-block { border: 1px solid #000; margin-bottom: 8pt; display: table; width: 100%; border-collapse: collapse; }
  .bank-row { display: table-row; }
  .bank-left { display: table-cell; border-right: 1px solid #000; padding: 4pt 6pt; width: 68%; vertical-align: top; }
  .bank-right { display: table-cell; padding: 4pt 6pt; vertical-align: top; width: 32%; }
  .bank-label { font-size: 8pt; color: #555; border-top: 1px solid #000; padding-top: 2pt; margin-top: 3pt; }
  .bank-value { font-size: 10pt; font-weight: bold; margin-bottom: 1pt; }
  .bank-subrow { border-top: 1px solid #000; }
  .bank-bik-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2pt; }
  .sn-label { font-size: 8pt; color: #555; margin-right: 4pt; }
  .sn-value { font-size: 10pt; font-weight: bold; }
  .invoice-title { font-size: 14pt; font-weight: bold; margin: 10pt 0 8pt 0; }
  .parties-block { font-size: 10pt; margin-bottom: 10pt; line-height: 1.5; }
  .parties-block b { font-weight: bold; }
  .services-table { width: 100%; border-collapse: collapse; margin-bottom: 4pt; font-size: 10pt; }
  .services-table th { border: 1px solid #000; padding: 5pt 4pt; text-align: center; font-weight: bold; background: #f5f5f5; font-size: 9pt; }
  .services-table td { border: 1px solid #000; padding: 5pt 4pt; vertical-align: top; }
  .services-table td.num  { text-align: center; width: 28pt; }
  .services-table td.qty  { text-align: center; width: 42pt; }
  .services-table td.unit { text-align: center; width: 36pt; }
  .services-table td.price{ text-align: right;  width: 72pt; }
  .services-table td.sum  { text-align: right;  width: 72pt; }
  .totals-table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; }
  .totals-table td { padding: 2pt 4pt; font-size: 10pt; }
  .totals-table td.label { text-align: right; color: #333; width: 75%; }
  .totals-table td.amount { text-align: right; font-weight: bold; width: 25%; border-bottom: 1px solid #000; }
  .totals-table tr.grand td { font-size: 11pt; font-weight: bold; padding-top: 4pt; }
  .summary-line { border-top: 2px solid #000; padding-top: 5pt; margin-bottom: 3pt; font-size: 10pt; }
  .summary-words { font-size: 10pt; font-weight: bold; margin-bottom: 20pt; }
  .signatures { display: flex; gap: 40pt; margin-top: 10pt; }
  .sig-block { display: flex; align-items: center; gap: 12pt; font-size: 10pt; }
  .sig-role { white-space: nowrap; line-height: 1.3; font-size: 9pt; }
  .sig-line { width: 80pt; border-bottom: 1px solid #000; height: 18pt; display: flex; align-items: flex-end; justify-content: center; font-size: 9pt; padding-bottom: 1pt; }
  .sig-image { max-height: 40pt; object-fit: contain; mix-blend-mode: multiply; }
  @media print { .page { padding: 15mm 15mm 15mm 20mm; } @page { size: A4; margin: 0; } }
</style>
</head>
<body>
<div class="page">
  <div class="bank-block">
    <div class="bank-row">
      <div class="bank-left">
        <div class="bank-value">{{my_bank}}</div>
        <div class="bank-label">Банк получателя</div>
        <div class="bank-subrow" style="margin-top:4pt;padding-top:4pt;">
          <span style="font-size:9pt;">ИНН {{my_inn}}</span>&nbsp;&nbsp;&nbsp;<span style="font-size:9pt;">КПП {{my_kpp}}</span>
        </div>
        <div class="bank-value" style="margin-top:2pt;">{{my_name}}</div>
        <div class="bank-label">Получатель</div>
      </div>
      <div class="bank-right">
        <div class="bank-bik-row"><span class="sn-label">БИК</span><span class="sn-value">{{my_bik}}</span></div>
        <div style="border-top:1px solid #000;padding-top:3pt;margin-bottom:3pt;">
          <span class="sn-label">Сч. №</span><span class="sn-value" style="font-size:9pt;">{{my_corr}}</span>
        </div>
        <div class="bank-label" style="margin-bottom:3pt;">Корр. счёт</div>
        <div style="border-top:1px solid #000;padding-top:3pt;">
          <span class="sn-label">Сч. №</span><span class="sn-value" style="font-size:9pt;">{{my_account}}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="invoice-title">Счет на оплату № {{doc_number}} от {{doc_date}}</div>
  <div class="parties-block">
    <b>Поставщик:</b>&nbsp; {{my_name}} ИНН {{my_inn}}, КПП {{my_kpp}}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{my_address}}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;тел.: {{my_phone}}{{#if my_fax}}, факс: {{my_fax}}{{/if}}<br>
    <b>Покупатель:</b>&nbsp; {{client_name}}
  </div>
  <table class="services-table">
    <thead>
      <tr><th class="num">№</th><th>Товары (работы, услуги)</th><th class="qty">Кол-во</th><th class="unit">Ед.</th><th class="price">Цена</th><th class="sum">Сумма</th></tr>
    </thead>
    <tbody>
      {{#each services_list}}
      <tr><td class="num">{{index}}</td><td>{{name}}</td><td class="qty">{{qty}}</td><td class="unit">{{unit}}</td><td class="price">{{price}}</td><td class="sum">{{sum}}</td></tr>
      {{else}}
      <tr><td class="num">1</td><td>Услуги по временному размещению в коттедже {{cottage_name}} с {{deal_start}} по {{deal_end}} по договору №{{doc_number}}</td><td class="qty">1</td><td class="unit">усл</td><td class="price">{{doc_amount}}</td><td class="sum">{{doc_amount}}</td></tr>
      {{/each}}
    </tbody>
  </table>
  <table class="totals-table">
    <tr><td class="label">Итого:</td><td class="amount">{{doc_amount}}</td></tr>
    <tr><td class="label">С учетом (НДС) {{vat_rate}}%</td><td class="amount" style="font-weight:bold;color:#c00;">{{vat_amount}}</td></tr>
    <tr class="grand"><td class="label">Всего к оплате:</td><td class="amount">{{doc_amount}}</td></tr>
  </table>
  <div class="summary-line">Всего наименований {{services_count}}, на сумму {{doc_amount}} руб.</div>
  <div class="summary-words">{{doc_amount_words}}</div>
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-role">Генеральный<br>директор</div>
      <div class="sig-line">{{#if my_signature}}<img src="{{my_signature}}" class="sig-image" alt="подпись">{{/if}}</div>
      <div style="font-size:10pt;">/{{my_signatory_name}}/</div>
    </div>
    <div class="sig-block">
      <div class="sig-role">Бухгалтер</div>
      <div class="sig-line">{{#if my_signature}}<img src="{{my_signature}}" class="sig-image" alt="подпись">{{/if}}</div>
      <div style="font-size:10pt;">/{{my_signatory_name}}/</div>
    </div>
  </div>
</div>
</body>
</html>`
  },
  akt: {
    title: "Акт выполненных работ",
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  .page { width: 210mm; min-height: 297mm; padding: 15mm 15mm 15mm 20mm; margin: 0 auto; background: #fff; }
  .act-title { font-size: 14pt; font-weight: bold; margin-bottom: 10pt; }
  .parties-block { font-size: 10pt; margin-bottom: 10pt; line-height: 1.6; }
  .services-table { width: 100%; border-collapse: collapse; margin-bottom: 4pt; font-size: 10pt; }
  .services-table th { border: 1px solid #000; padding: 5pt 4pt; text-align: center; font-weight: bold; background: #f5f5f5; font-size: 9pt; }
  .services-table td { border: 1px solid #000; padding: 5pt 4pt; vertical-align: top; }
  .services-table td.num  { text-align: center; width: 28pt; }
  .services-table td.qty  { text-align: center; width: 42pt; }
  .services-table td.unit { text-align: center; width: 36pt; }
  .services-table td.price{ text-align: right;  width: 72pt; }
  .services-table td.sum  { text-align: right;  width: 72pt; }
  .totals-table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; }
  .totals-table td { padding: 2pt 4pt; font-size: 10pt; }
  .totals-table td.label  { text-align: right; width: 75%; }
  .totals-table td.amount { text-align: right; font-weight: bold; width: 25%; border-bottom: 1px solid #000; }
  .totals-table tr.grand td { font-size: 11pt; font-weight: bold; padding-top: 4pt; }
  .completion-text { font-size: 10pt; margin: 12pt 0 16pt 0; line-height: 1.5; }
  .summary-line { border-top: 2px solid #000; padding-top: 5pt; margin-bottom: 3pt; font-size: 10pt; }
  .summary-words { font-size: 10pt; font-weight: bold; margin-bottom: 24pt; }
  .signatures-table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
  .signatures-table td { width: 50%; padding: 0 8pt 0 0; vertical-align: top; font-size: 10pt; }
  .sig-party-title { font-weight: bold; margin-bottom: 6pt; font-size: 10pt; }
  .sig-party-info { font-size: 9pt; margin-bottom: 8pt; line-height: 1.4; color: #333; }
  .sig-row { display: flex; align-items: flex-end; gap: 8pt; margin-top: 6pt; }
  .sig-role-label { font-size: 9pt; white-space: nowrap; line-height: 1.3; }
  .sig-line { flex: 1; border-bottom: 1px solid #000; height: 20pt; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1pt; }
  .sig-image { max-height: 40pt; object-fit: contain; mix-blend-mode: multiply; }
  .sig-name-label { font-size: 9pt; white-space: nowrap; }
  @media print { .page { padding: 15mm 15mm 15mm 20mm; } @page { size: A4; margin: 0; } }
</style>
</head>
<body>
<div class="page">
  <div class="act-title">Акт № {{doc_number}} от {{deal_end_full}}</div>
  <div class="parties-block"><b>Исполнитель:</b>&nbsp; {{my_name}}<br><b>Заказчик:</b>&nbsp; {{client_name}}</div>
  <table class="services-table">
    <thead>
      <tr><th class="num">№</th><th>Наименование работ, услуг</th><th class="qty">Кол-во</th><th class="unit">Ед.</th><th class="price">Цена</th><th class="sum">Сумма</th></tr>
    </thead>
    <tbody>
      {{#each services_list}}
      <tr><td class="num">{{index}}</td><td>{{name}}</td><td class="qty">{{qty}}</td><td class="unit">{{unit}}</td><td class="price">{{price}}</td><td class="sum">{{sum}}</td></tr>
      {{else}}
      <tr><td class="num">1</td><td>Услуги по временному размещению в коттедже {{cottage_name}} с {{deal_start}} по {{deal_end}} по договору №{{doc_number}}</td><td class="qty">1</td><td class="unit">усл</td><td class="price">{{doc_amount}}</td><td class="sum">{{doc_amount}}</td></tr>
      {{/each}}
    </tbody>
  </table>
  <table class="totals-table">
    <tr><td class="label">Итого:</td><td class="amount">{{doc_amount}}</td></tr>
    <tr><td class="label">С учетом (НДС) {{vat_rate}}%</td><td class="amount" style="font-weight:bold;color:#c00;">{{vat_amount}}</td></tr>
    <tr class="grand"><td class="label">Всего к оплате:</td><td class="amount">{{doc_amount}}</td></tr>
  </table>
  <div class="completion-text">Вышеперечисленные услуги выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.</div>
  <div class="summary-line">Всего наименований {{services_count}}, на сумму {{doc_amount}} руб.</div>
  <div class="summary-words">{{doc_amount_words}}</div>
  <table class="signatures-table">
    <tr>
      <td>
        <div class="sig-party-title">ИСПОЛНИТЕЛЬ</div>
        <div class="sig-party-info">{{my_signatory_role}} {{my_name}}</div>
        <div class="sig-row">
          <div class="sig-line">{{#if my_signature}}<img src="{{my_signature}}" class="sig-image" alt="">{{/if}}</div>
          <div class="sig-name-label">/{{my_signatory_name}}/</div>
        </div>
        {{#if my_stamp}}<div style="margin-top:6pt;"><img src="{{my_stamp}}" style="max-height:70pt;mix-blend-mode:multiply;opacity:0.85;" alt="печать"></div>{{/if}}
      </td>
      <td>
        <div class="sig-party-title">ЗАКАЗЧИК</div>
        <div class="sig-party-info">{{client_name}}</div>
        <div class="sig-row"><div class="sig-line"></div><div class="sig-name-label">/{{client_name_short}}/</div></div>
      </td>
    </tr>
  </table>
</div>
</body>
</html>`
  }
};

Handlebars.registerHelper('incline', function(fio, targetCase) {
  try {
    const res = incline(fio, targetCase);
    return res || fio;
  } catch(e) { return fio; }
});

const VARIABLE_GROUPS = [
  { 
    id: "blocks", 
    label: "ГОТОВЫЕ БЛОКИ", 
    icon: <Sparkles className="h-4 w-4 text-cyan-400" />, 
    variables: [
      { id: 'services_loop', label: 'Таблица услуг (Цикл)' },
      { id: 'guests_loop', label: 'Список гостей (Цикл)' },
      { id: 'signatures_table', label: 'Блок подписей (2 колонки)' },
      { id: 'requisites_table', label: 'Реквизиты (2 колонки)' },
    ] 
  },
  {
    id: "client",
    label: "КОНТРАГЕНТ",
    icon: <User className="h-4 w-4 text-blue-500" />,
    variables: [
      { id: 'client_name', label: 'ФИО / Название' },
      { id: 'client_phone', label: 'Телефон' },
      { id: 'client_inn', label: 'ИНН' },
      { id: 'client_kpp', label: 'КПП' },
      { id: 'client_ogrn', label: 'ОГРН' },
      { id: 'client_address', label: 'Адрес регистрации' },
      { id: 'client_bank', label: 'Наименование банка' },
      { id: 'client_bik', label: 'БИК банка' },
      { id: 'client_account', label: 'Расчетный счет' },
      { id: 'client_corr', label: 'Корр. счет' },
      { id: 'client_passport', label: 'Паспортные данные' },
      { id: 'client_email', label: 'E-mail клиента' },
      { id: 'client_signatory', label: 'ФИО Подписанта' },
      { id: 'client_basis', label: 'Действует на основании' },
      { id: 'client_name_short', label: 'ФИО клиента (сокр.)' },
    ]
  },
  {
    id: "deal",
    label: "ДОКУМЕНТ / СДЕЛКА",
    icon: <FileCheck className="h-4 w-4 text-emerald-500" />,
    variables: [
      { id: 'doc_number', label: 'Номер документа' },
      { id: 'doc_date', label: 'Дата документа' },
      { id: 'doc_amount', label: 'Сумма общая' },
      { id: 'vat_amount', label: 'Сумма НДС' },
      { id: 'doc_amount_words', label: 'Сумма прописью' },
      { id: 'vat_amount_words', label: 'НДС прописью' },
      { id: 'doc_prepayment', label: 'Сумма предоплаты' },
      { id: 'doc_remaining', label: 'Остаток оплаты' },
      { id: 'doc_remaining_words', label: 'Остаток прописью' },
      { id: 'deal_start', label: 'Дата начала' },
      { id: 'deal_end', label: 'Дата окончания' },
      { id: 'deal_days', label: 'Общее кол-во дней' },
      { id: 'checkin_time', label: 'Время заезда' },
      { id: 'checkout_time', label: 'Время выезда' },
      { id: 'guest_count', label: 'Кол-во гостей' },
      { id: 'parent_invoice_number', label: 'Номер счета основания' },
      { id: 'vat_rate', label: 'Ставка НДС' },
      { id: 'vat_amount', label: 'Сумма НДС' },
      { id: 'services_count', label: 'Количество услуг' },
      { id: 'deal_end_full', label: 'Дата выезда (полностью)' },
    ]
  },
  {
    id: "company",
    label: "МОЯ КОМПАНИЯ",
    icon: <Building2 className="h-4 w-4 text-amber-500" />,
    variables: [
      { id: 'my_short_name', label: 'Краткое название' },
      { id: 'my_name', label: 'Полное название' },
      { id: 'my_inn', label: 'ИНН организации' },
      { id: 'my_kpp', label: 'КПП организации' },
      { id: 'my_ogrn', label: 'ОГРН организации' },
      { id: 'my_address', label: 'Юридический адрес' },
      { id: 'my_postal', label: 'Почтовый адрес' },
      { id: 'my_phone', label: 'Контактный телефон' },
      { id: 'my_signatory_role', label: 'Должность рук.' },
      { id: 'my_signatory_name', label: 'ФИО руководителя' },
      { id: 'my_bank', label: 'Банк компании' },
      { id: 'my_bik', label: 'БИК компании' },
      { id: 'my_account', label: 'Расчетный счет комп.' },
      { id: 'my_corr', label: 'Корр. счет комп.' },
      { id: 'my_city', label: 'Город' },
      { id: 'my_fax', label: 'Факс' },
    ]
  },
  {
    id: "object",
    label: "ОБЪЕКТЫ / УСЛУГИ",
    icon: <Home className="h-4 w-4 text-blue-400" />,
    variables: [
      { id: 'property_name', label: 'Название базы' },
      { id: 'cottage_name', label: 'Название дома' },
      { id: 'cottage_capacity', label: 'Вместимость дома' },
      { id: 'property_address', label: 'Адрес базы' },
      { id: 'sauna_price', label: 'Стоимость бани' },
      { id: 'sauna_time', label: 'Время бани' },
    ]
  },
  {
    id: "logic",
    label: "ЛОГИКА И УСЛОВИЯ",
    icon: <Sparkles className="h-4 w-4 text-purple-400" />,
    variables: [
      { id: '#if sauna_included', label: 'Старт условия (Баня)' },
      { id: 'else', label: 'Иначе (Альтернатива)' },
      { id: '/if', label: 'Конец условия' },
    ]
  },
  {
    id: "signatures",
    label: "ПОДПИСИ СТОРОН",
    icon: <Sparkles className="h-4 w-4 text-rose-500" />,
    variables: [
      { id: 'two_column_block', label: 'Блок 2 колонки' },
      { id: 'signatures_table', label: 'Блок подписей (2 колонки)' },
      { id: 'requisites_block', label: 'Реквизиты' },
      { id: 'page_break', label: 'Разрыв страницы' },
      { id: 'my_sign_stamp', label: 'Место для печати' },
      { id: 'my_stamp', label: 'Ваша печать (картинка)' },
      { id: 'my_signature', label: 'Ваша подпись (картинка)' },
    ]
  }
];

export function TemplateBuilder({ onBack, templateId }: TemplateBuilderProps) {
  const [title, setTitle] = useState("Новый шаблон договора");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [pageSettings, setPageSettings] = useState({
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 10,
    stampBase64: "",
    signatureBase64: ""
  });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!templateId || hasLoaded) return;
    setIsLoading(true);
    fetch(`${API_URL}/templates/${templateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTitle(data.data.title || "Без названия");
          const html = data.data.html_content || DEFAULT_CONTENT;
          setContent(html);
          setPageSettings(prev => ({ ...prev, ...data.data.settings }));
          setHasLoaded(true);
          if (editorInstance) {
            editorInstance.commands.setContent(html);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [templateId, editorInstance, hasLoaded]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: templateId || undefined,
          title,
          html_content: content,
          settings: pageSettings
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Шаблон успешно сохранен!");
        if (!templateId) onBack();
      } else {
        toast.error("Ошибка: " + data.error);
      }
    } catch (e) {
      toast.error("Сбой соединения: " + (e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      toast.error("Пожалуйста, выберите файл .docx");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setContent(result.value);
        if (editorInstance) editorInstance.commands.setContent(result.value);
        toast.success("Документ успешно импортирован!");
      } catch (error) {
        toast.error("Ошибка при чтении .docx файла");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const livePreviewHtml = useMemo(() => {
    try {
      // 1. Превращаем Tiptap-ноды в Handlebars-переменные для рендера
      const templateString = content.replace(/<span\s+[^>]*data-type="variable"[^>]*>.*?<\/span>/g, (match) => {
        const idMatch = match.match(/data-id="([^"]+)"/);
        const id = idMatch ? idMatch[1] : '';
        
        // Специальная обработка для картинок (Печать / Подпись)
        if (id === 'my_stamp' || id === 'my_signature') {
          const src = id === 'my_stamp' ? pageSettings.stampBase64 : pageSettings.signatureBase64;
          if (src) return `<img src="${src}" style="max-height: 80px; mix-blend-mode: multiply; vertical-align: middle;" />`;
          return `<span style="color: #94a3b8; border: 1px dashed #cbd5e1; padding: 2px 4px; font-size: 10px;">[${id === 'my_stamp' ? 'Печать' : 'Подпись'}]</span>`;
        }
        
        return id ? `{{${id}}}` : match;
      });
      
      // 2. Компилируем и рендерим через Handlebars
      const template = Handlebars.compile(templateString);
      return template(MOCK_DATA);
    } catch (e) {
      console.error("Preview Error:", e);
      return "<div class='p-4 text-red-500 bg-red-50 rounded-lg'><b>Ошибка предпросмотра:</b> Проверьте правильность расстановки переменных {{ }}</div>";
    }
  }, [content, pageSettings.stampBase64, pageSettings.signatureBase64]);

  const insertVariable = (id: string, label: string) => {
    if (!editorInstance) return;
    if (id === 'signatures_table') {
      editorInstance.chain().focus().insertContent([
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: [330] },
                  content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'ИСПОЛНИТЕЛЬ', marks: [{ type: 'bold' }] }] },
                    { type: 'paragraph', content: [{ type: 'variable', attrs: { id: 'my_name', label: 'Мое ФИО' } }] },
                    { type: 'paragraph', content: [
                      { type: 'text', text: '________________ / ' },
                      { type: 'variable', attrs: { id: 'my_signatory_name', label: 'Подписант' } },
                      { type: 'text', text: ' /' }
                    ]},
                    { type: 'paragraph', content: [
                      { type: 'variable', attrs: { id: 'my_signature', label: 'Подпись' } },
                      { type: 'text', text: ' ' },
                      { type: 'variable', attrs: { id: 'my_stamp', label: 'Печать' } }
                    ]}
                  ]
                },
                {
                  type: 'tableCell',
                  attrs: { colspan: 1, rowspan: 1, colwidth: [330] },
                  content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'ЗАКАЗЧИК', marks: [{ type: 'bold' }] }] },
                    { type: 'paragraph', content: [{ type: 'variable', attrs: { id: 'client_name', label: 'ФИО клиента' } }] },
                    { type: 'paragraph', content: [{ type: 'text', text: '________________ / ________ /' }] },
                    { type: 'paragraph', content: [{ type: 'text', text: 'Дата: ' }, { type: 'variable', attrs: { id: 'doc_date', label: 'Дата' } }] }
                  ]
                }
              ]
            }
          ]
        }
      ]).run();
    } else if (id === 'services_loop') {
      editorInstance.commands.chessInsertBlock({ html: `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 40px; font-size: 12px;">№</th>
              <th style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 12px;">Наименование услуги</th>
              <th style="border: 1px solid #000; padding: 5px; text-align: center; width: 100px; font-size: 12px;">Сумма (руб.)</th>
            </tr>
          </thead>
          <tbody>
            {{#each services_list}}
            <tr>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 11px;">{{index}}</td>
              <td style="border: 1px solid #000; padding: 5px; font-size: 11px;">{{name}}</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 11px;">{{sum}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      `});
    } else if (id === 'guests_loop') {
      editorInstance.commands.chessInsertBlock({ html: `
        <p style="margin-top: 15px;"><strong>Список проживающих:</strong></p>
        <p style="font-size: 11px; line-height: 1.4;">
          {{#each guests_list}}
            {{index}}. {{fio}} ({{doc}})<br>
          {{/each}}
        </p>
      `});
    } else if (id === 'requisites_block' || id === 'requisites_table') {
      editorInstance.commands.chessInsertBlock({ html: `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tbody>
            <tr>
              <td style="width: 50%; border: 1px solid #000; padding: 12px; vertical-align: top; font-size: 10px;">
                <p><strong>ИСПОЛНИТЕЛЬ</strong></p>
                <div style="margin-top: 8px;">
                  {{my_name}}<br>
                  ИНН {{my_inn}} / КПП {{my_kpp}}<br>
                  {{my_address}}
                </div>
              </td>
              <td style="width: 50%; border: 1px solid #000; padding: 12px; vertical-align: top; font-size: 10px;">
                <p><strong>ЗАКАЗЧИК</strong></p>
                <div style="margin-top: 8px;">
                  {{client_name}}<br>
                  ИНН {{client_inn}}<br>
                  {{client_address}}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `});
    } else if (id === 'two_column_block') {
      editorInstance.commands.chessInsertBlock({ html: `
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr>
              <td style="width: 50%; border: none; padding: 0 8px 0 0; vertical-align: top;">Левая колонка</td>
              <td style="width: 50%; border: none; padding: 0 0 0 8px; vertical-align: top;">Правая колонка</td>
            </tr>
          </tbody>
        </table>
      `});
    } else if (id === 'page_break') {
      editorInstance.commands.chessInsertBlock({ html: '<div style="page-break-after: always;"></div>' });
    } else if (id === 'my_sign_stamp') {
      editorInstance.commands.chessInsertBlock({ html: '<p style="text-align: right;">М.П. ________________</p>' });
    } else {
      editorInstance.commands.chessInsertVariable({ id, label });
    }
    editorInstance.commands.focus();
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPageSettings(s => ({ ...s, stampBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPageSettings(s => ({ ...s, signatureBase64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative overflow-hidden">
      {/* HEADER */}
      <header className="flex-none h-16 border-b border-border/60 bg-background/90 flex items-center justify-between px-4 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 rounded-lg hover:bg-muted transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="h-5 w-px bg-border/50 mx-1" />
          <div className="flex flex-col">
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="h-7 text-sm font-bold bg-transparent border-none p-0 focus-visible:ring-0 w-[400px] shadow-none placeholder:text-muted-foreground/30"
              placeholder="Введите название шаблона..."
            />
            <span className="text-[9px] text-muted-foreground font-black tracking-widest uppercase opacity-50">Конструктор документов CHCH</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PRESETS */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 transition-all font-sans px-4">
                <Wand2 className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Библиотека актов</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 bg-zinc-900 border-white/5 shadow-2xl">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase px-2 py-1 tracking-widest">Выберите макет</p>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <Button 
                    key={key} 
                    variant="ghost" 
                    className="w-full justify-start text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 h-9 rounded-lg"
                    onClick={() => {
                       setContent(preset.html);
                       if (editorInstance) editorInstance.commands.setContent(preset.html);
                       toast.success(`Загружен макет: ${preset.title}`);
                    }}
                  >
                    {preset.title}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-5 w-px bg-border/50 mx-1" />
          {/* DOCX IMPORT */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            className="h-9 rounded-lg gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all font-sans px-4"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase tracking-tight">Импорт .docx</span>
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleDocxUpload} 
            accept=".docx" 
            className="hidden" 
          />

          {/* PREVIEW MODAL */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 transition-all font-sans px-4">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Предпросмотр</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[1000px] h-[90vh] p-0 flex flex-col bg-[#0a0a0b] border-white/5 overflow-hidden shadow-2xl">
              <DialogHeader className="p-4 border-b border-white/5 bg-zinc-900/50 shrink-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 px-2">Режим предпросмотра (A4)</DialogTitle>
                </div>
              </DialogHeader>
              <ScrollArea className="flex-1 p-12 bg-[#050505]">
                <div className="flex flex-col items-center gap-8 pb-20 mt-4 leading-none">
                  <div 
                     className="bg-white rounded-[2px] w-[210mm] min-h-[297mm] p-[25mm] text-black shadow-[0_30px_80px_-15px_rgba(0,0,0,1)] transition-transform overflow-hidden relative"
                  >
                    <div 
                      className="prose prose-sm prose-p:leading-tight prose-headings:font-bold max-w-none text-black"
                      dangerouslySetInnerHTML={{ __html: livePreviewHtml }} 
                    />
                    {pageSettings.stampBase64 && (
                      <div className="absolute right-12 bottom-12 opacity-80 mix-blend-multiply pointer-events-none">
                        <img src={pageSettings.stampBase64} alt="Stamp" className="w-[140px] transform-gpu rotate-[-5deg]" />
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-white/5 bg-zinc-900/80 backdrop-blur-md flex justify-end gap-3 shrink-0">
                <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-lg h-10 px-8 text-slate-400 hover:text-white font-sans text-xs font-bold">ОТМЕНА</Button>
                <Button className="rounded-lg h-10 px-8 bg-emerald-500 hover:bg-emerald-400 text-black font-black font-sans text-xs shadow-lg">СКАЧАТЬ PDF</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 text-muted-foreground border-white/5 hover:bg-white/5 px-4 transition-all">
                <Settings className="h-3.5 w-3.5" />
                <span className="text-xs font-bold uppercase tracking-tight">Настройки</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-zinc-950 border-white/10 text-white leading-none">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold uppercase tracking-widest">Параметры страницы</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ сверху (мм)</Label>
                     <Input type="number" value={pageSettings.marginTop} onChange={e => setPageSettings(s => ({...s, marginTop: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ снизу (мм)</Label>
                     <Input type="number" value={pageSettings.marginBottom} onChange={e => setPageSettings(s => ({...s, marginBottom: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ слева (мм)</Label>
                     <Input type="number" value={pageSettings.marginLeft} onChange={e => setPageSettings(s => ({...s, marginLeft: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase text-muted-foreground">Отступ справа (мм)</Label>
                     <Input type="number" value={pageSettings.marginRight} onChange={e => setPageSettings(s => ({...s, marginRight: Number(e.target.value)}))} className="bg-zinc-900 border-white/5" />
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black text-blue-400 uppercase flex items-center gap-2"><ImageIcon className="h-4 w-4" /> ПЕЧАТЬ И ПОДПИСЬ</Label>
                  <Input type="file" accept="image/*" onChange={handleStampUpload} className="text-xs bg-zinc-900 border-white/5" />
                  {pageSettings.stampBase64 && (
                    <div className="mt-2 p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center gap-3">
                      <img src={pageSettings.stampBase64} alt="Stamp" className="max-h-[100px] object-contain mix-blend-multiply transition-all grayscale contrast-[1.2]" />
                      <Button variant="ghost" size="sm" onClick={() => setPageSettings(s => ({...s, stampBase64: ""}))} className="w-full text-xs text-destructive hover:bg-destructive/10">УДАЛИТЬ ПЕЧАТЬ</Button>
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/60 leading-tight">Загрузите PNG с прозрачным фоном. Она будет добавлена на каждую страницу при генерации PDF.</p>
                </div>
                
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <Label className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-2"><Sparkles className="h-4 w-4" /> ВАША ПОДПИСЬ</Label>
                  <Input type="file" accept="image/*" onChange={handleSignatureUpload} className="text-xs bg-zinc-900 border-white/5" />
                  {pageSettings.signatureBase64 && (
                    <div className="mt-2 p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center gap-3">
                      <img src={pageSettings.signatureBase64} alt="Signature" className="max-h-[80px] object-contain mix-blend-multiply transition-all grayscale contrast-[1.2]" />
                      <Button variant="ghost" size="sm" onClick={() => setPageSettings(s => ({...s, signatureBase64: ""}))} className="w-full text-xs text-destructive hover:bg-destructive/10">УДАЛИТЬ ПОДПИСЬ</Button>
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground/60 leading-tight">Загрузите вашу рукописную подпись в формате PNG (желательно без фона).</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isSaving} 
            className="h-9 rounded-lg gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black font-sans px-6 shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="text-xs">{isSaving ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ ШАБЛОН"}</span>
          </Button>
        </div>
      </header>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COMPONENT: EDITOR */}
        <div className="flex-1 border-r border-border/40 flex flex-col bg-[#070708]">
          <TiptapEditor 
            content={content} 
            onChange={setContent} 
            onInit={setEditorInstance} 
            stampBase64={pageSettings.stampBase64}
            signatureBase64={pageSettings.signatureBase64}
          />
        </div>

        {/* RIGHT COMPONENT: VARIABLES */}
        <div className="w-[340px] shrink-0 border-l border-border/40 flex flex-col bg-[#0d0d0f] overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-5 bg-white/5 border-b border-white/5 backdrop-blur-sm">
              <h3 className="font-extrabold text-[10px] mb-4 flex items-center gap-2 text-yellow-500 tracking-[0.2em] uppercase">
                <FileText className="h-3.5 w-3.5" /> ПЕРЕМЕННЫЕ
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <Input
                  placeholder="Найти в библиотеке..."
                  className="pl-10 h-10 bg-zinc-950 border-white/5 text-xs focus:ring-yellow-500/50 placeholder:text-slate-700 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
              <Accordion type="multiple" defaultValue={["client", "blocks"]} className="space-y-3 pb-24">
                {VARIABLE_GROUPS.map((group) => {
                  const filtered = group.variables.filter(v => 
                    v.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    v.id.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) return null;

                  return (
                    <AccordionItem key={group.id} value={group.id} className="border-none bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl px-2 overflow-hidden shadow-sm">
                      <AccordionTrigger className="hover:no-underline py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-zinc-950 border border-white/5 text-slate-400 group-hover:text-yellow-500 transition-colors shadow-inner">
                            {group.icon}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {group.label}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0 pb-6 px-2">
                        <div className="flex flex-col gap-2">
                          {filtered.map((v) => (
                            <div
                              key={v.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/x-tiptap-variable', JSON.stringify({ id: v.id, label: v.label }));
                              }}
                              onClick={() => insertVariable(v.id, v.id)}
                              className="group cursor-grab active:cursor-grabbing flex flex-col border border-white/5 bg-zinc-950/50 hover:bg-zinc-900 hover:border-yellow-500/30 p-3.5 rounded-xl transition-all active:scale-[0.97] shadow-sm"
                              title={v.id}
                            >
                              <span className="text-xs font-bold text-slate-200 group-hover:text-yellow-500 transition-colors">
                                {v.label}
                              </span>
                              <div className="flex items-center gap-1 mt-1 font-mono text-[9px] text-slate-600 uppercase tracking-tighter transition-colors group-hover:text-yellow-500/50">
                                <span>{"{{"}</span>
                                <span>{v.id}</span>
                                <span>{"}}"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
