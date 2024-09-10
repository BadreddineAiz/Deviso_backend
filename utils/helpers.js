const dateFns = require("date-fns");

// We want to make this function work for both Date objects and strings (which come from Supabase)
exports.subtractDates = (dateStr1, dateStr2) =>
  dateFns.differenceInDays(
    dateFns.parseISO(String(dateStr1)),
    dateFns.parseISO(String(dateStr2))
  );

exports.formatDistanceFromNow = (dateStr) =>
  dateFns
    .formatDistance(dateFns.parseISO(dateStr), new Date(), {
      addSuffix: true,
    })
    .replace("about ", "")
    .replace("in", "In");

// Supabase needs an ISO date string. However, that string will be different on every render because the MS or SEC have changed, which isn't good. So we use this trick to remove any time
exports.getToday = function (options = {}) {
  const today = new Date();

  // This is necessary to compare with created_at from Supabase, because it it not at 0.0.0.0, so we need to set the date to be END of the day when we compare it with earlier dates
  if (options?.end)
    // Set to the last second of the day
    today.setUTCHours(23, 59, 59, 999);
  else today.setUTCHours(0, 0, 0, 0);
  return today.toISOString();
};

exports.formatCurrency = (value) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(
    value
  );

const units = [
  "",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
];
const teens = [
  "dix",
  "onze",
  "douze",
  "treize",
  "quatorze",
  "quinze",
  "seize",
  "dix-sept",
  "dix-huit",
  "dix-neuf",
];
const tens = [
  "",
  "",
  "vingt",
  "trente",
  "quarante",
  "cinquante",
  "soixante",
  "soixante",
  "quatre-vingt",
  "quatre-vingt",
];
const hundred = "cent";
const thousand = "mille";
const million = "million";
const billion = "milliard";

exports.numberToFrench = (n) => {
  if (typeof n !== "number" || isNaN(n)) {
    return "Nombre invalide";
  }

  const isNegative = n < 0;
  n = Math.abs(n);

  const integerPart = Math.floor(n);
  const decimalPart = Math.round((n - integerPart) * 100);

  let result = convertInteger(integerPart);

  if (decimalPart > 0) {
    result += " virgule " + convertInteger(decimalPart);
  }

  if (isNegative) {
    result = "moins " + result;
  }

  return result;
};

function convertInteger(n) {
  if (n === 0) return "zéro";
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    if (n % 10 === 0) return tens[Math.floor(n / 10)];
    if (n < 70 || (n >= 80 && n < 90)) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 === 1 ? "-et-" : "-") + units[n % 10]
      );
    } else {
      return tens[Math.floor(n / 10)] + "-" + teens[n % 10];
    }
  }
  if (n < 1000) {
    if (n === 100) return "cent";
    if (n % 100 === 0) return units[Math.floor(n / 100)] + " " + hundred;
    return (
      (Math.floor(n / 100) > 1 ? units[Math.floor(n / 100)] + " " : "") +
      hundred +
      " " +
      convertInteger(n % 100)
    );
  }
  if (n < 1000000) {
    if (n === 1000) return thousand;
    if (n < 2000) return thousand + " " + convertInteger(n % 1000);
    return (
      convertInteger(Math.floor(n / 1000)) +
      " " +
      thousand +
      " " +
      convertInteger(n % 1000)
    );
  }
  if (n < 1000000000) {
    if (n === 1000000) return "un " + million;
    return (
      convertInteger(Math.floor(n / 1000000)) +
      " " +
      million +
      (Math.floor(n / 1000000) > 1 ? "s" : "") +
      " " +
      convertInteger(n % 1000000)
    );
  }
  if (n < 1000000000000) {
    if (n === 1000000000) return "un " + billion;
    return (
      convertInteger(Math.floor(n / 1000000000)) +
      " " +
      billion +
      (Math.floor(n / 1000000000) > 1 ? "s" : "") +
      " " +
      convertInteger(n % 1000000000)
    );
  }
  return "Nombre trop grand";
}

exports.filterObj = (obj, ...fields) => {
  const filtredObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (fields.includes(key)) {
      filtredObj[key] = value;
    }
  }
  return filtredObj;
};
