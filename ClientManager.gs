/************************************************
 * DOBRA PRZESTRZEŃ
 * CLIENT MANAGER
 ************************************************/

function generateNextClientId() {

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const lastRow = sh.getLastRow();

  if (lastRow < 2) {
    return CFG.CLIENT_ID_PREFIX + CFG.FIRST_CLIENT_ID;
  }

  const ids = sh
    .getRange(2,1,lastRow-1,1)
    .getValues()
    .flat()
    .filter(String);

  let maxId = CFG.FIRST_CLIENT_ID;

  ids.forEach(id => {

    const num = parseInt(
      String(id).replace(CFG.CLIENT_ID_PREFIX,"")
    );

    if(num > maxId){
      maxId = num;
    }

  });

  return CFG.CLIENT_ID_PREFIX + (maxId + 1);

}


/************************************************/

function buildQrText(clientId, firstName, lastName){

  return `${clientId}|${firstName} ${lastName}`;

}

/************************************************/

function buildQrUrl(qrText){

  return "https://quickchart.io/qr?size=500&text="
    + encodeURIComponent(qrText);

}

/************************************************/

function createClient(
  firstName,
  lastName,
  phone,
  email,
  packageSize
){

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const clientId = generateNextClientId();

  const qrData = buildQrText(
    clientId,
    firstName,
    lastName
  );

  const qrUrl = buildQrUrl(qrData);

  sh.appendRow([

    clientId,
    firstName,
    lastName,
    phone,
    email,
    packageSize,
    packageSize,
    "",
    "",
    "TAK",
    qrData,
    qrUrl

  ]);

  return {
    id: clientId,
    qrData: qrData,
    qrUrl: qrUrl
  };

}
function regenerateAllQrCodes(){

  const sh = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CFG.SHEET_CLIENTS);

  const lastRow = sh.getLastRow();

  if(lastRow < 2){
    return;
  }

  const data = sh
    .getRange(2,1,lastRow-1,3)
    .getValues();

  const qrData = [];
  const qrUrl = [];

  data.forEach(row => {

    const id = row[0];
    const firstName = row[1];
    const lastName = row[2];

    const text =
      id + "|" +
      firstName + " " +
      lastName;

    qrData.push([text]);

    qrUrl.push([
      buildQrUrl(text)
    ]);

  });

  sh.getRange(
    2,
    11,
    qrData.length,
    1
  ).setValues(qrData);

  sh.getRange(
    2,
    12,
    qrUrl.length,
    1
  ).setValues(qrUrl);

}
function testCreateClient(){

  const result = createClient(
    "Anna",
    "Kowalska",
    "600700800",
    "anna@test.pl",
    12
  );

  Logger.log(result);

}