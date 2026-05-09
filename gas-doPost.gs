const SHEET_NAME = "diagnosis_results";

function doPost(e) {
  const sheet = getSheet();
  const data = JSON.parse(e.postData.contents);
  console.log("Received payload:", data);
  console.log("Received displayName:", data.displayName || "");
  const answers = data.answers || [];
  const answerMap = answers.reduce((map, item) => {
    map[item.id] = item.answer || "";
    return map;
  }, {});

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.displayName || "",
    data.score ?? "",
    data.level || "",
    answerMap.q1 || "",
    answerMap.q2 || "",
    answerMap.q3 || "",
    answerMap.q4 || "",
    answerMap.q5 || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "送信日時",
      "LINE表示名",
      "スコア",
      "レベル",
      "Q1 楽器演奏経験",
      "Q2 耳コピ曲数",
      "Q3 DAW操作",
      "Q4 ベロシティ/アーティキュレーション",
      "Q5 口ドラム",
    ]);
  }

  return sheet;
}
