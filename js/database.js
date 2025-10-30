// Database Abstraction Layer
class Database {
    constructor() {
        this.type = (typeof CONFIG !== 'undefined' && CONFIG.DATABASE_TYPE) ? CONFIG.DATABASE_TYPE : 'sheetdb';
        this.init();
    }

    init() {
        if (this.type === 'google_sheets') {
            const scriptUrl = (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_SHEETS && CONFIG.GOOGLE_SHEETS.SCRIPT_URL)
                ? CONFIG.GOOGLE_SHEETS.SCRIPT_URL
                : null;
            this.db = new GoogleSheetsDB(scriptUrl);
        } else if (this.type === 'sheetdb') {
            // Use the provided SheetDB base API URL. If you have a different URL in CONFIG, it will be preferred.
            const sheetdbBase = (typeof CONFIG !== 'undefined' && CONFIG.SHEETDB && CONFIG.SHEETDB.BASE_URL)
                ? CONFIG.SHEETDB.BASE_URL
                : 'https://sheetdb.io/api/v1/kcsid6691qn5p';
            this.db = new SheetDB(sheetdbBase);
        }
    }

    async submitApplication(data) {
        return await this.db.submitApplication(data);
    }

    async submitDonation(data) {
        return await this.db.submitDonation(data);
    }

    async submitVolunteer(data) {
        return await this.db.submitVolunteer(data);
    }

    async getStatistics() {
        return await this.db.getStatistics();
    }
}

// Google Sheets Implementation
class GoogleSheetsDB {
    constructor(scriptUrl) {
        this.scriptUrl = scriptUrl;
    }

    async submitApplication(data) {
        const response = await fetch(this.scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submitApplication',
                ...data,
                timestamp: new Date().toLocaleString('bn-BD')
            })
        });
        return await response.json();
    }

    async submitDonation(data) {
        const response = await fetch(this.scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submitDonation',
                ...data,
                timestamp: new Date().toLocaleString('bn-BD')
            })
        });
        return await response.json();
    }

    async submitVolunteer(data) {
        const response = await fetch(this.scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'submitVolunteer',
                ...data,
                timestamp: new Date().toLocaleString('bn-BD')
            })
        });
        return await response.json();
    }

    async getStatistics() {
        const response = await fetch(`${this.scriptUrl}?action=getStats`);
        return await response.json();
    }
}

// SheetDB Implementation
class SheetDB {
    constructor(baseUrl) {
        // baseUrl should be like: https://sheetdb.io/api/v1/kcsid6691qn5p
        this.baseUrl = baseUrl.replace(/\/+$/, ''); // trim trailing slashes
    }

    async submitApplication(data) {
        const payload = {
            data: [
                {
                    timestamp: new Date().toISOString(),
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    type: data.type || '',
                    amount: data.amount || '',
                    details: data.details || '',
                    status: 'Pending'
                }
            ]
        };

        const response = await fetch(`${this.baseUrl}?sheet=applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    }

    async submitDonation(data) {
        const payload = {
            data: [
                {
                    timestamp: new Date().toISOString(),
                    name: data.name || 'Anonymous',
                    phone: data.phone || 'N/A',
                    type: data.type || '',
                    amount: data.amount || '',
                    method: data.method || '',
                    details: data.details || 'N/A'
                }
            ]
        };

        const response = await fetch(`${this.baseUrl}?sheet=donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    }

    async submitVolunteer(data) {
        const payload = {
            data: [
                {
                    timestamp: new Date().toISOString(),
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    occupation: data.occupation || '',
                    helpTypes: Array.isArray(data.helpTypes) ? data.helpTypes.join(', ') : (data.helpTypes || ''),
                    hours: data.hours || '',
                    extra: data.extra || 'N/A',
                    status: 'Pending'
                }
            ]
        };

        const response = await fetch(`${this.baseUrl}?sheet=volunteers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return await response.json();
    }

    async getStatistics() {
        try {
            // Fetch all rows for each sheet and compute counts
            const [appsRes, donsRes, volsRes] = await Promise.all([
                fetch(`${this.baseUrl}?sheet=applications`),
                fetch(`${this.baseUrl}?sheet=donations`),
                fetch(`${this.baseUrl}?sheet=volunteers`)
            ]);

            const [appsJson, donsJson, volsJson] = await Promise.all([
                appsRes.ok ? appsRes.json() : [],
                donsRes.ok ? donsRes.json() : [],
                volsRes.ok ? volsRes.json() : []
            ]);

            const totalApplications = Array.isArray(appsJson) ? appsJson.length : 0;
            const totalDonations = Array.isArray(donsJson) ? donsJson.length : 0;
            const totalVolunteers = Array.isArray(volsJson) ? volsJson.length : 0;

            const successRate = totalApplications > 0
                ? `${Math.round((totalDonations / totalApplications) * 100)}%`
                : '0%';

            return {
                status: 'success',
                data: {
                    totalApplications,
                    totalDonations,
                    totalVolunteers,
                    successRate
                }
            };
        } catch (err) {
            return {
                status: 'error',
                message: err.message || 'Failed to fetch statistics'
            };
        }
    }
            }
