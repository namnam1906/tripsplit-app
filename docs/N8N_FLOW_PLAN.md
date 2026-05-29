# n8n Flow Plan

## Flow 1: Create Trip
Webhook: POST /create-trip
1. รับ tripName, members
2. Google Drive: Create Folder ภายใต้ parent folder
3. Google Sheets: Create Spreadsheet หรือ copy template
4. ย้าย Sheet เข้า Drive folder
5. ตอบ tripId, folderUrl, sheetUrl

## Flow 2: OCR Receipt
Webhook: POST /ocr-receipt
1. รับไฟล์รูปใบเสร็จ
2. HTTP Request ไป Akson OCR
3. Normalize: merchant, date, total, line items
4. ตอบกลับเป็น draft expense

## Flow 3: Save Expense
Webhook: POST /save-expense
1. รับ expense object
2. Append row ลง Google Sheet
3. Trigger recalculation summary
4. ตอบสถานะสำเร็จ
