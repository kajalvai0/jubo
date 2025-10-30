// Configuration File (updated to use SheetDB API links)

// Base SheetDB ID: kcsid6691qn5p
// You can override the base URL in localStorage by setting 'sheetdbBaseUrl'
// Example: localStorage.setItem('sheetdbBaseUrl', 'https://sheetdb.io/api/v1/YOUR_ID');

const CONFIG = (function () {
    // Base SheetDB URL (can be overriden from localStorage)
    const SHEETDB_BASE = localStorage.getItem('sheetdbBaseUrl') || 'https://sheetdb.io/api/v1/kcsid6691qn5p';

    // Helper to build a SheetDB URL for a specific sheet
    // sheetName: the name of the sheet/tab in your Google Sheet (exactly as in SheetDB)
    // params: optional object of query params that will be appended
    function buildSheetUrl(sheetName, params = {}) {
        // start with sheet param to select the sheet/tab
        const url = new URL(SHEETDB_BASE);
        url.searchParams.set('sheet', sheetName);

        // append any additional params (like filters, limit, etc.)
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) url.searchParams.set(k, v);
        }
        return url.toString();
    }

    return {
        // App Configuration
        APP: {
            NAME: 'কর্জে হাসানা',
            VERSION: '1.0.0',
            CONTACT: {
                PHONE: '+8801755383039',
                EMAIL: 'jubajamayat.badalgachi@gmail.com'
            }
        },

        // SheetDB Configuration
        SHEETDB: {
            // Base URL (useful if you rotate the sheetdb ID or use a proxy)
            BASE_URL: SHEETDB_BASE,

            // Sheet-specific endpoints (points to individual sheets/tabs)
            APPLICATIONS_URL: buildSheetUrl('Applications'),
            DONATIONS_URL: buildSheetUrl('Donations'),
            VOLUNTEERS_URL: buildSheetUrl('Volunteers'),

            // If your SheetDB instance requires an API key or custom headers,
            // add them here. SheetDB typically doesn't require an API key for
            // public sheets, but you can add a value and the app can read it.
            OPTIONAL: {
                API_KEY: localStorage.getItem('sheetdbApiKey') || '', // place API key here if required
                // Example custom headers (the app making requests can read this)
                HEADERS: {
                    // 'Authorization': `Bearer ${localStorage.getItem('sheetdbApiKey') || ''}`
                }
            },

            // Helper (exposed for runtime use)
            buildSheetUrl
        },

        // Google Sheets fallback (kept for backward compatibility)
        GOOGLE_SHEETS: {
            SCRIPT_URL: localStorage.getItem('korjeHasanaScriptUrl') || '',
            SHEET_ID: localStorage.getItem('korjeHasanaSheetId') || ''
        },

        // Database Type: choose 'sheetdb' or 'google_sheets'
        DATABASE_TYPE: 'sheetdb'
    };
})();
