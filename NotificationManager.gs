/************************************************

* DOBRA PRZESTRZEŃ
* NOTIFICATION MANAGER
  ************************************************/

function getSetting(param) {

const sh = SpreadsheetApp
.getActiveSpreadsheet()
.getSheetByName(CFG.SHEET_SETTINGS);

const data = sh.getDataRange().getValues();

for (let i = 1; i < data.length; i++) {

```
if (String(data[i][0]).trim() === param) {
  return data[i][1];
}
```

}

return null;
}

/************************************************/

function notificationsEnabled() {

return String(
getSetting("EMAIL_NOTIFICATIONS")
).toUpperCase() === "TAK";

}

/************************************************/

function updateLastEmail(clientRow) {

const sh = SpreadsheetApp
.getActiveSpreadsheet()
.getSheetByName(CFG.SHEET_CLIENTS);

sh.getRange(clientRow, 17)
.setValue(getNow());

}

/************************************************/

function sendEmail(subject, body, recipient) {

if (!notificationsEnabled()) {
return false;
}

recipient = String(
recipient || ""
).trim();

if (!recipient) {
return false;
}

MailApp.sendEmail({
to: recipient,
subject: subject,
body: body,
name: "Dobra Przestrzeń"
});

return true;

}

/************************************************/

function sendCheckinEmail(
client,
className,
remaining
) {

const subject =
"Dobra Przestrzeń - Potwierdzenie uczestnictwa";

const body =
`Dzień dobry ${client.firstName},

Potwierdzamy udział w zajęciach:

${className}

Odjęto 1 wejście.

Pozostało wejść: ${remaining}

Dziękujemy.

Dobra Przestrzeń`;

if (
sendEmail(
subject,
body,
client.email
)
) {
updateLastEmail(client.row);
}

}

/************************************************/

function sendRechargeEmail(
client,
added,
remaining
) {

const subject =
"Dobra Przestrzeń - Doładowanie pakietu";

const body =
`Dzień dobry ${client.firstName},

Na Twoje konto dodano:

${added} wejść

Aktualny stan:

${remaining} wejść

Dziękujemy.

Dobra Przestrzeń`;

if (
sendEmail(
subject,
body,
client.email
)
) {
updateLastEmail(client.row);
}

}

/************************************************/

function sendLowCreditAlert(
client,
remaining
) {

const subject =
"Dobra Przestrzeń - Niski stan wejść";

const body =
`Dzień dobry ${client.firstName},

Na Twoim koncie pozostało:

${remaining} wejść.

Zapraszamy do odnowienia pakietu.

Dobra Przestrzeń`;

if (
sendEmail(
subject,
body,
client.email
)
) {
updateLastEmail(client.row);
}

}
