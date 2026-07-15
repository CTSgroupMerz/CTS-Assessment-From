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
// ไม่ต้องตั้งค่าอะไร: ถ้าสคริปต์ไม่ได้ผูกกับชีต จะ "สร้าง Google Sheet ใหม่ให้เอง"
// ครั้งแรก แล้วจำ ID ไว้ใน Script Properties (ชีตจะไปอยู่ใน Google Drive ของผู้ deploy)
// * จะบังคับใช้ชีตที่มีอยู่แล้ว ก็ใส่ ID ที่ SHEET_ID ได้ (จาก URL: /d/<ID>/edit)
var SHEET_ID = '';

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
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID)
                    : (SpreadsheetApp.getActiveSpreadsheet() || openOrCreate_());
  var sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(['id', 'json', 'updatedAt']); }
  return sh;
}

// สคริปต์ standalone: ใช้ชีตที่จำไว้ ถ้ายังไม่มี → สร้างใหม่ + จำ ID ไว้ (ครั้งเดียว)
function openOrCreate_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} } // เผื่อชีตถูกลบ → สร้างใหม่
  var ss = SpreadsheetApp.create('Merz Assessment Data');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
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
