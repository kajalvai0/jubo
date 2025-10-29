# Setup Guide - Korje Hasana

## Google Sheets Setup

### 1. Google Sheets তৈরি করুন
- [sheets.google.com](https://sheets.google.com) এ যান
- নতুন Spreadsheet তৈরি করুন
- নিচের Sheets তৈরি করুন:
  - Applications
  - Donations  
  - Volunteers

### 2. Apps Script তৈরি করুন
- Sheets-এ Tools > Script Editor
- `google-apps-script/Code.gs` কোড পেস্ট করুন
- YOUR_SPREADSHEET_ID রিপ্লেস করুন

### 3. Deploy করুন
- Deploy > New deployment
- Type: Web App
- Execute as: Me
- Access: Anyone
- Script URL কপি করুন

### 4. কনফিগার করুন
- ওয়েবসাইটের Setup পেজে Script URL দিন
- সংযোগ পরীক্ষা করুন

## SheetDB Setup (Alternative)

### 1. অ্যাকাউন্ট তৈরি করুন
- [sheetdb.io](https://sheetdb.io) এ যান
- ফ্রি অ্যাকাউন্ট তৈরি করুন

### 2. Sheets তৈরি করুন
- Applications, Donations, Volunteers Sheets তৈরি করুন
- API URLs নোট করুন

### 3. কনফিগার করুন
- `js/config.js` এ URLs সেট করুন
- DATABASE_TYPE: 'sheetdb' সেট করুন

## Deployment

### GitHub Pages
1. Repository তৈরি করুন
2. Settings > Pages > Deploy from main branch
3. Live URL পেয়ে যাবেন

### Netlify
1. Netlify অ্যাকাউন্ট তৈরি করুন
2. GitHub repository connect করুন
3. Automatic deployment হবে
