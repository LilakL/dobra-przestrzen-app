/******************************************************
 * DOBRA PRZESTRZEŃ
 * CONFIG.GS
 ******************************************************/

/************ ARKUSZE ************/
const CFG = {

  APP_NAME: "Dobra Przestrzeń",

  SHEET_CLIENTS: "KLIENCI",
  SHEET_SCHEDULE: "GRAFIK",
  SHEET_CHECKIN: "CHECKIN_LOG",
  SHEET_RECHARGE: "DOŁADOWANIA",
  SHEET_SETTINGS: "USTAWIENIA",
  SHEET_REPORTS: "RAPORTY",
  SHEET_START: "START",
  SHEET_CLIENT_HISTORY: "HISTORIA_KLIENTA",

  CLIENT_ID_PREFIX: "DP",
  FIRST_CLIENT_ID: 1001,

  QR_SIZE: 500,

  DEFAULT_EMAIL: "fitwitheveline@gmail.com",

  CACHE_TIME_SEC: 300

};

/******************************************************
 * AUTORYZOWANE TELEFONY
 ******************************************************/
const AUTH_DEVICES = {

  "885831777": {
    owner: "Konrad",
    token: "tokenKonrad"
  },

  "723981333": {
    owner: "Ewelina",
    token: "tokenEwelina"
  },

  "510144956": {
    owner: "Kornelia",
    token: "tokenKornelia"
  }

};

/******************************************************
 * ROLE
 ******************************************************/
const OPERATORS = {

  "tokenKonrad": "Konrad",
  "tokenEwelina": "Ewelina",
  "tokenKornelia": "Kornelia"

};

/******************************************************
 * STATUSY
 ******************************************************/
const STATUS = {

  OK: "OK",
  ERROR: "ERROR",
  BLOCKED: "BLOCKED"

};

/******************************************************
 * PAKIETY
 ******************************************************/
const PACKAGES = [

  1,
  2,
  4,
  8,
  10,
  12,
  16,
  20,
  24

];

/******************************************************
 * DNI TYGODNIA
 ******************************************************/
const DAYS = [

  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela"

];

/******************************************************
 * POMOCNICZE
 ******************************************************/

function getTodayDate() {

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

}

function getNow() {

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );

}

function getCurrentDayName() {

  const days = [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota"
  ];

  return days[new Date().getDay()];

}

/******************************************************
 * TOKEN
 ******************************************************/

function validateToken(token) {

  return Object.values(AUTH_DEVICES)
    .some(x => x.token === token);

}

function getOperatorName(token) {

  return OPERATORS[token] || "Nieznany";

}

/******************************************************
 * GENEROWANIE ID
 *
 * KR1001
 * KR1002
 * KR1003
 ******************************************************/

function generateNextClientId() {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const lastRow = sh.getLastRow();

  if (lastRow < 2) {
    return CFG.CLIENT_ID_PREFIX + CFG.FIRST_CLIENT_ID;
  }

  const ids = sh
    .getRange(2, 1, lastRow - 1, 1)
    .getValues()
    .flat()
    .filter(String);

  let maxId = CFG.FIRST_CLIENT_ID - 1;

  ids.forEach(id => {

    const nr = parseInt(
      String(id)
      .replace(CFG.CLIENT_ID_PREFIX, "")
    );

    if (!isNaN(nr) && nr > maxId) {
      maxId = nr;
    }

  });

  return CFG.CLIENT_ID_PREFIX + (maxId + 1);

} 
function logClientHistory(
  type,
  client,
  details,
  before,
  change,
  after,
  operator
) {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(
      CFG.SHEET_CLIENT_HISTORY
    );

  sh.appendRow([
    getNow(),
    type,
    client.id,
    client.firstName + " " + client.lastName,
    details,
    before,
    change,
    after,
    operator
  ]);

}