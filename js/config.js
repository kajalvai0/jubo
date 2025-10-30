// Configuration File
const CONFIG = {
    // Google Sheets Configuration
    GOOGLE_SHEETS: {
        SCRIPT_URL: localStorage.getItem('korjeHasanaScriptUrl') || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
        SHEET_ID: 'YOUR_GOOGLE_SHEET_ID'
    },
    
    // SheetDB Configuration (Alternative)
    SHEETDB: {
        APPLICATIONS_URL: 'https://sheetdb.io/api/v1/kcsid6691qn5p',
        DONATIONS_URL: 'https://sheetdb.io/api/v1/kcsid6691qn5p',
        VOLUNTEERS_URL: 'https://sheetdb.io/api/v1/kcsid6691qn5p'
    },
    
    // App Configuration
    APP: {
        NAME: 'কর্জে হাসানা',
        VERSION: '1.0.0',
        CONTACT: {
            PHONE: '+8801755383039',
            EMAIL: 'jubajamayat.badalgachi@gmail.com'
        }
    },
    
    // Database Type (google_sheets or sheetdb)
    DATABASE_TYPE: 'sheetdb'
};
