function doGet(e) {

  const token = e?.parameter?.token || "";

  const tpl = HtmlService.createTemplateFromFile("Panel");

  tpl.token = token;
  tpl.appName = CFG.APP_NAME;

  return tpl
    .evaluate()
    .setTitle(CFG.APP_NAME)
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}

function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();

}