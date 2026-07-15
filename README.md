# Merz Aesthetics · Assessment (PWA)

แบบประเมิน Filler & Botulinum Toxin — ติดตั้งเป็นแอปบนมือถือได้ (PWA), ทำงาน offline,
และ **แชร์ข้อมูลชุดเดียวกันทุกคน** ผ่าน Google Apps Script + Google Sheet

## ไฟล์
- `index.html` — ตัวแอป (ฟอร์ม + สรุป + export JPG/PDF)
- `manifest.webmanifest`, `sw.js`, `icon.svg` — PWA (ติดตั้ง + offline)
- `Code.gs` — backend สำหรับ Google Apps Script (ไฟล์นี้ไม่ได้รันบนเว็บ เอาไปวางใน Apps Script)

## 1) เปิดใช้ข้อมูลร่วม (backend)
1. สร้าง Google Sheet ใหม่ → **Extensions → Apps Script**
2. วางโค้ดจาก `Code.gs` → Save
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. คัดลอก Web app URL (ลงท้าย `/exec`)
5. ใน `index.html` แก้บรรทัด `const API_URL = ''` → ใส่ URL นั้น
   > เว้นว่างไว้ = แอปทำงานเฉพาะในเครื่อง (localStorage) เหมือนเดิม
6. commit + push (GitHub Pages จะอัปเดตให้อัตโนมัติ)

> แก้ `Code.gs` ทีหลังต้อง **Manage deployments → Edit → New version** ทุกครั้ง

## 2) Publish เป็นเว็บ (GitHub Pages)
Repo → **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `root` → Save
เว็บจะอยู่ที่ `https://<user>.github.io/<repo>/`

## การ sync ทำงานยังไง
- บันทึก/ลบ → เขียน localStorage ทันที แล้วส่งขึ้น server (fire-and-forget)
- เปิดแอป → ดึงจาก server มา merge (server ชนะเมื่อ `updatedAt` ใหม่กว่า) → เห็นข้อมูลล่าสุด
- ออฟไลน์ก็ยังใช้ได้ ข้อมูลค้างในเครื่อง เดี๋ยว sync รอบหน้า
