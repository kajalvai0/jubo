// Database Abstraction Layer
class Database {
    constructor() {
        this.type = CONFIG.DATABASE_TYPE;
        this.init();
    }

    init() {
        if (this.type === 'google_sheets') {
            this.db = new GoogleSheetsDB(CONFIG.GOOGLE_SHEETS.SCRIPT_URL);
        } else if (this.type === 'sheetdb') {
            this.db = new SheetDB({
                applications: CONFIG.SHEETDB.APPLICATIONS_URL,
                donations: CONFIG.SHEETDB.DONATIONS_URL,
                volunteers: CONFIG.SHEETDB.VOLUNTEERS_URL
            });
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
    constructor(urls) {
        this.urls = urls;
    }

    async submitApplication(data) {
        const response = await fetch(this.urls.applications, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    timestamp: new Date().toISOString(),
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    type: data.type,
                    amount: data.amount,
                    details: data.details,
                    status: 'Pending'
                }
            })
        });
        return await response.json();
    }

    async submitDonation(data) {
        const response = await fetch(this.urls.donations, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    timestamp: new Date().toISOString(),
                    name: data.name || 'Anonymous',
                    phone: data.phone || 'N/A',
                    type: data.type,
                    amount: data.amount,
                    method: data.method,
                    details: data.details || 'N/A'
                }
            })
        });
        return await response.json();
    }

    async submitVolunteer(data) {
        const response = await fetch(this.urls.volunteers, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    timestamp: new Date().toISOString(),
                    name: data.name,
                    phone: data.phone,
                    address: data.address,
                    occupation: data.occupation,
                    helpTypes: data.helpTypes,
                    hours: data.hours,
                    extra: data.extra || 'N/A',
                    status: 'Pending'
                }
            })
        });
        return await response.json();
    }

    async getStatistics() {
        // For SheetDB, you might need to implement separate API calls
        // This is a simplified version
        return {
            status: 'success',
            data: {
                totalApplications: 0,
                totalDonations: 0,
                totalVolunteers: 0,
                successRate: '0%'
            }
        };
    }
    }
