// Merz Assessment — shared backend (Google Apps Script + Google Sheet)
//
// วิธี deploy:
//  1. เปิด Google Sheet ใหม่ → เมนู Extensions → Apps Script
//  2. วางโค้ดนี้ทับ Code.gs เดิม → Save
//  3. Deploy → New deployment → เลือก type "Web app"
//       Execute as: Me          Who has access: Anyone
//  4. คัดลอก Web app URL (ลงท้าย /exec) ไปใส่ในตัวแปร API_URL ใน index.html
//  * ทุกครั้งที่แก้ Code.gs ต้อง Deploy → Manage deployments → Edit → New version

var SHEET = 'records';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var req = JSON.parse(e.postData.contents);
    if (req.action === 'list')   return json_({ ok: true, records: listRecords_() });
    if (req.action === 'save')   return json_(saveRecord_(req.record));
    if (req.action === 'delete') return json_(deleteRecord_(req.id));
    return json_({ ok: false, error: 'unknown action: ' + req.action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// เผื่อเปิด URL ตรงๆ / debug — คืนรายการทั้งหมด
function doGet() { return json_({ ok: true, records: listRecords_() }); }

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(['id', 'json', 'updatedAt']); }
  return sh;
}

function listRecords_() {
  var v = sheet_().getDataRange().getValues(), out = [];
  for (var i = 1; i < v.length; i++) {
    if (v[i][0]) { try { out.push(JSON.parse(v[i][1])); } catch (e) {} }
  }
  return out;
}

function saveRecord_(rec) {
  if (!rec || !rec.id) return { ok: false, error: 'no id' };
  rec.updatedAt = rec.updatedAt || new Date().toISOString();
  var sh = sheet_(), v = sh.getDataRange().getValues(), row = JSON.stringify(rec);
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]) === String(rec.id)) {
      sh.getRange(i + 1, 2).setValue(row);
      sh.getRange(i + 1, 3).setValue(rec.updatedAt);
      return { ok: true, id: rec.id };
    }
  }
  sh.appendRow([rec.id, row, rec.updatedAt]);
  return { ok: true, id: rec.id };
}

function deleteRecord_(id) {
  var sh = sheet_(), v = sh.getDataRange().getValues();
  for (var i = v.length - 1; i >= 1; i--) {
    if (String(v[i][0]) === String(id)) sh.deleteRow(i + 1);
  }
  return { ok: true, id: id };
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
