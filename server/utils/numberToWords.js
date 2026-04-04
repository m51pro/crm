/**
 * Преобразование числа в сумму прописью (рубли и копейки) на русском языке.
 * Пример: 123.45 -> "Сто двадцать три рубля 45 копеек"
 */
export function numberToWords(n) {
  if (n === null || n === undefined || isNaN(n)) return "";

  const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const onesFem = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const teens = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];
  
  const thousands = ["", "тысяча", "тысячи", "тысяч"];
  const millions = ["", "миллион", "миллиона", "миллионов"];

  function getPlural(n, forms) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return forms[3];
    if (mod10 === 1) return forms[1];
    if (mod10 >= 2 && mod10 <= 4) return forms[2];
    return forms[3];
  }

  function convertSmall(n, isFem = false) {
    let res = "";
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h > 0) res += hundreds[h] + " ";
    if (t === 1) {
      res += teens[o] + " ";
    } else {
      if (t > 1) res += tens[t] + " ";
      if (o > 0) res += (isFem ? onesFem[o] : ones[o]) + " ";
    }
    return res;
  }

  const integerPart = Math.floor(n);
  const fractionalPart = Math.round((n - integerPart) * 100);

  let result = "";

  if (integerPart === 0) {
    result = "ноль ";
  } else {
    const mln = Math.floor(integerPart / 1000000);
    const ths = Math.floor((integerPart % 1000000) / 1000);
    const units = integerPart % 1000;

    if (mln > 0) result += convertSmall(mln) + getPlural(mln, millions) + " ";
    if (ths > 0) result += convertSmall(ths, true) + getPlural(ths, thousands) + " ";
    if (units > 0) result += convertSmall(units);
  }

  const rubForm = getPlural(integerPart, ["", "рубль", "рубля", "рублей"]);
  const kopForm = getPlural(fractionalPart, ["", "копейка", "копейки", "копеек"]);
  
  const formattedKop = fractionalPart.toString().padStart(2, "0");
  
  result = result.trim();
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return `${result} ${rubForm} ${formattedKop} ${kopForm}`;
}
