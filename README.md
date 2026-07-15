# Merz Aesthetics · Assessment (PWA)

แบบประเมิน Filler & Botulinum Toxin — ติดตั้งเป็นแอปบนมือถือได้ (PWA), ทำงาน offline,
และ **แชร์ข้อมูลชุดเดียวกันทุกคน** ผ่าน Google Apps Script + Google Sheet

## ไฟล์
- `index.html` — ตัวแอป (ฟอร์ม + สรุป + export JPG/PDF)
- `manifest.webmanifest`, `sw.js`, `icon.svg` — PWA (ติดตั้ง + offline)
- `Code.gs` — backend สำหรับ Google Apps Script (ไฟล์นี้ไม่ได้รันบนเว็บ เอาไปวางใน Apps Script)

## 1) เปิดใช้ข้อมูลร่วม (backend)
1. เปิด [script.google.com](https://script.google.com) → New project → วางโค้ดจาก `Code.gs` → Save
   > ไม่ต้องสร้าง Google Sheet เอง — โค้ดสร้างชีต "Merz Assessment Data" ให้อัตโนมัติครั้งแรก
   > (ชีตไปอยู่ใน Google Drive ของบัญชีที่ deploy) หรือจะบังคับใช้ชีตเดิมก็ใส่ `SHEET_ID` ได้
2. **Deploy → New deployment → Web app** — Execute as: **Me** / Who has access: **Anyone** → Authorize
3. คัดลอก Web app URL (ลงท้าย `/exec`) → ใส่ที่ `const API_URL` ใน `index.html`
   > URL ปัจจุบันฝังไว้แล้ว ถ้า deploy ใหม่ได้ URL อื่นค่อยแก้ตรงนี้

> แก้ `Code.gs` ทีหลังต้อง **Manage deployments → Edit → New version** ทุกครั้ง

## 2) Publish เป็นเว็บ (GitHub Pages)
Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `root` → Save
เว็บจะอยู่ที่ `https://<user>.github.io/<repo>/`

## การ sync ทำงานยังไง
- บันทึก/ลบ → เขียน localStorage ทันที แล้วส่งขึ้น server (fire-and-forget)
- เปิดแอป → ดึงจาก server มา merge (server ชนะเมื่อ `updatedAt` ใหม่กว่า) → เห็นข้อมูลล่าสุด
- ออฟไลน์ก็ยังใช้ได้ ข้อมูลค้างในเครื่อง เดี๋ยว sync รอบหน้า
