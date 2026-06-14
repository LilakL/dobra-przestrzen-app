/******************************************************
 * FIT WITH EVELINE 2.0
 * API.GS
 ******************************************************/

/******************************************************
 * KLIENCI
 ******************************************************/

function getClientById(clientId) {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const data = sh.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {

    if (String(data[i][0]).trim() === String(clientId).trim()) {

      return {
        row: i + 1,

        id: data[i][0],
        firstName: data[i][1],
        lastName: data[i][2],
        phone: data[i][3],
        email: data[i][4],

        packageSize: Number(data[i][5] || 0),
        remaining: Number(data[i][6] || 0),

        lastCheckin: data[i][7],
        lastRecharge: data[i][8],

        active: data[i][9],

        qrData: data[i][10],
        qrUrl: data[i][11],
        qrImage: data[i][12],
        pdfCard: data[i][13],

        status: data[i][14],
        emailNotifications: data[i][15],
        lastEmail: data[i][16]
      };

    }
  }

  return null;
}

/******************************************************
 * PODGLĄD PO SKANIE QR
 ******************************************************/

function apiPreview(token, clientId) {

  if (!validateToken(token)) {
    return {
      ok: false,
      msg: "Brak dostępu"
    };
  }

  const client = getClientById(clientId);

  if (!client) {
    return {
      ok: false,
      msg: "Nie znaleziono klienta"
    };
  }

  return {
    ok: true,
    id: client.id,
    name: client.firstName + " " + client.lastName,
    remaining: client.remaining
  };
}

/******************************************************
 * GRAFIK
 ******************************************************/

function apiGetSchedule() {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_SCHEDULE);

  const data = sh.getDataRange().getValues();

  const result = [];

  for (let i = 1; i < data.length; i++) {

    if (String(data[i][3]).toUpperCase() !== "TAK") {
      continue;
    }

const hour = Utilities.formatDate(
  new Date(data[i][1]),
  Session.getScriptTimeZone(),
  "HH:mm"
);

result.push({
  day: data[i][0],
  hour: hour,
  className: data[i][2]
});
  }

  return result;
}

/******************************************************
 * CHECK-IN
 ******************************************************/

function apiCheckin(token, clientId, day, hour, className) {

  if (!validateToken(token)) {
    return {
      ok: false,
      msg: "Brak dostępu"
    };
  }

  const client = getClientById(clientId);

  if (!client) {
    return {
      ok: false,
      msg: "Nie znaleziono klienta"
    };
  }

  if (client.active !== "TAK") {
    return {
      ok: false,
      msg: "Klient nieaktywny"
    };
  }

  if (client.remaining <= 0) {
    return {
      ok: false,
      msg: "Brak wejść"
    };
  }

  const uniqueCheckinKey =
    getTodayDate() + "|" +
    day + "|" +
    hour + "|" +
    className;

  if (String(client.lastCheckin) === uniqueCheckinKey) {

    return {
      ok: false,
      msg: "Klient już odbity"
    };

  }

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const before = client.remaining;
  const after = before - 1;

  sh.getRange(client.row, 7).setValue(after);
  sh.getRange(client.row, 8).setValue(uniqueCheckinKey);

  logCheckin(
    client,
    day,
    hour,
    className,
    before,
    after,
    getOperatorName(token)
  );
logClientHistory(
  "CHECKIN",
  client,
  className,
  before,
  -1,
  after,
  getOperatorName(token)
);
  try {

    if (
      client.email &&
      String(client.emailNotifications)
        .toUpperCase() === "TAK"
    ) {

      sendCheckinEmail(
        client,
        className,
        after
      );

      const lowLimit =
        Number(
          getSetting(
            "LOW_CREDIT_ALERT"
          ) || 3
        );

      if (after <= lowLimit) {

        sendLowCreditAlert(
          client,
          after
        );

      }

    }

  }
  catch(err){

    Logger.log(err);

  }

  return {
    ok: true,
    before: before,
    after: after
  };

}

/******************************************************
 * DOŁADOWANIE
 ******************************************************/

function apiRecharge(token, clientId, amount) {

  if (!validateToken(token)) {
    return {
      ok: false,
      msg: "Brak dostępu"
    };
  }

  amount = Number(amount);

  if (amount <= 0) {
    return {
      ok: false,
      msg: "Błędna ilość"
    };
  }

  const client = getClientById(clientId);

  if (!client) {
    return {
      ok: false,
      msg: "Nie znaleziono klienta"
    };
  }

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const before = client.remaining;
  const after = before + amount;

  sh.getRange(client.row, 7).setValue(after);
  sh.getRange(client.row, 9).setValue(getNow());

  logRecharge(
    client,
    amount,
    before,
    after,
    getOperatorName(token)
  );
logClientHistory(
  "DOŁADOWANIE",
  client,
  "+" + amount,
  before,
  amount,
  after,
  getOperatorName(token)
);
  try {

    if (
      client.email &&
      String(client.emailNotifications)
        .toUpperCase() === "TAK"
    ) {

      sendRechargeEmail(
        client,
        amount,
        after
      );

    }

  }
  catch(err){

    Logger.log(err);

  }

  return {
    ok: true,
    before: before,
    after: after
  };

}

/******************************************************
 * LOG CHECK-IN
 ******************************************************/

function logCheckin(
  client,
  day,
  hour,
  className,
  before,
  after,
  operator
) {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CHECKIN);

  sh.appendRow([
    getNow(),
    client.id,
    client.firstName + " " + client.lastName,
    day,
    hour,
    className,
    before,
    after,
    operator,
    STATUS.OK
  ]);

}

/******************************************************
 * LOG DOŁADOWANIA
 ******************************************************/

function logRecharge(
  client,
  packageSize,
  before,
  after,
  operator
) {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_RECHARGE);

  sh.appendRow([
    getNow(),
    client.id,
    client.firstName + " " + client.lastName,
    "+" + packageSize,
    before,
    after,
    operator,
    STATUS.OK
  ]);

}

/******************************************************
 * TEST
 ******************************************************/

function testApi() {

  Logger.log(
    apiGetSchedule()
  );

}
function testClient() {

  const result = apiPreview(
    "tokenKonrad",
    "DP1001"
  );

  Logger.log(result);

}
/******************************************************
 * PANEL
 ******************************************************/

function apiGetOperator(token){

  if(!validateToken(token)){
    return {
      ok:false,
      name:"Brak dostępu"
    };
  }

  return {
    ok:true,
    name:getOperatorName(token)
  };

}

function apiGetPackages(){

  return PACKAGES;

}
