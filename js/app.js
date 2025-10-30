// Main Application Logic

// Database implementation using SheetDB API
// NOTE: This implementation expects three sheets in your sheetDB:
// - "applications"  (for application form submissions)
// - "donations"     (for donation form submissions)
// - "volunteers"    (for volunteer form submissions)
// If your sheet names differ, update the `SHEETS` mapping below accordingly.

class Database {
    constructor() {
        this.base = 'https://sheetdb.io/api/v1/kcsid6691qn5p';
        // Map logical sheet names to actual sheet names in your SheetDB
        this.SHEETS = {
            applications: 'applications',
            donations: 'donations',
            volunteers: 'volunteers'
        };
    }

    // Helper to POST a single row to a specific sheet
    async postRow(sheetName, row) {
        const url = `${this.base}?sheet=${encodeURIComponent(sheetName)}`;
        const payload = { data: [row] };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`SheetDB POST failed: ${res.status} ${res.statusText} ${text}`);
        }

        // SheetDB returns the created rows as JSON; using that as success signal
        const json = await res.json().catch(() => null);
        return json;
    }

    async submitApplication(data) {
        try {
            // Normalize field names if you'd like; here we send the object as-is
            await this.postRow(this.SHEETS.applications, data);
            return { status: 'success' };
        } catch (error) {
            console.error('submitApplication error:', error);
            return { status: 'error', error: String(error) };
        }
    }

    async submitDonation(data) {
        try {
            // ensure amount is numeric and store consistently
            if (data.amount) {
                const n = Number(String(data.amount).replace(/[^\d.-]/g, '')) || 0;
                data.amount = n;
            } else {
                data.amount = 0;
            }

            await this.postRow(this.SHEETS.donations, data);
            return { status: 'success' };
        } catch (error) {
            console.error('submitDonation error:', error);
            return { status: 'error', error: String(error) };
        }
    }

    async submitVolunteer(data) {
        try {
            await this.postRow(this.SHEETS.volunteers, data);
            return { status: 'success' };
        } catch (error) {
            console.error('submitVolunteer error:', error);
            return { status: 'error', error: String(error) };
        }
    }

    // Fetch all rows from a sheet
    async fetchSheet(sheetName) {
        const url = `${this.base}?sheet=${encodeURIComponent(sheetName)}`;
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`SheetDB GET failed: ${res.status} ${res.statusText} ${text}`);
        }
        const json = await res.json();
        // SheetDB returns an array of objects
        return json;
    }

    // Compute basic statistics from sheets
    async getStatistics() {
        try {
            const [apps, dons, vols] = await Promise.all([
                this.fetchSheet(this.SHEETS.applications).catch(() => []),
                this.fetchSheet(this.SHEETS.donations).catch(() => []),
                this.fetchSheet(this.SHEETS.volunteers).catch(() => [])
            ]);

            const totalApplications = Array.isArray(apps) ? apps.length : 0;
            const totalVolunteers = Array.isArray(vols) ? vols.length : 0;

            // Sum donation amounts, being defensive about field names
            const parseAmount = (row) => {
                if (!row || typeof row !== 'object') return 0;
                const candidates = ['amount', '_amount', 'Amount', 'AMOUNT', 'donateAmount', 'donate_amount', 'Amount (BDT)', 'amount_bdt'];
                for (const key of candidates) {
                    if (key in row && row[key] !== '') {
                        const n = Number(String(row[key]).replace(/[^\d.-]/g, ''));
                        if (!Number.isNaN(n)) return n;
                    }
                }
                // fallback: try to find any numeric-looking property
                for (const key of Object.keys(row)) {
                    const n = Number(String(row[key]).replace(/[^\d.-]/g, ''));
                    if (!Number.isNaN(n) && n !== 0) return n;
                }
                return 0;
            };

            const totalDonations = Array.isArray(dons) ? dons.reduce((sum, r) => sum + parseAmount(r), 0) : 0;

            // Compute a simple success rate: count rows in applications with status=approved (defensive)
            let successRate = 0;
            if (Array.isArray(apps) && apps.length > 0) {
                const approved = apps.filter(r => {
                    const val = (r.status || r.Status || r.STATUS || '').toString().trim().toLowerCase();
                    return val === 'approved' || val === 'success' || val === 'accepted';
                }).length;
                successRate = Math.round((approved / apps.length) * 100);
            }

            return {
                status: 'success',
                data: {
                    totalApplications,
                    totalDonations,
                    totalVolunteers,
                    successRate: `${successRate}%`
                }
            };
        } catch (error) {
            console.error('getStatistics error:', error);
            return { status: 'error', error: String(error) };
        }
    }
}

class KorjeHasanaApp {
    constructor() {
        this.db = new Database();
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.showPage('home');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            const navMenu = document.getElementById('navMenu');
            const hamburger = document.querySelector('.hamburger');
            
            if (navMenu && navMenu.classList.contains('active') && 
                !navMenu.contains(event.target) && 
                !hamburger.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    showPage(pageId) {
        this.currentPage = pageId;
        this.loadPageContent(pageId);
        this.closeMobileMenu();
        
        if (pageId === 'stats') {
            this.loadStats();
        }
    }

    async loadPageContent(pageId) {
        try {
            const response = await fetch(`pages/${pageId}.html`);
            const content = await response.text();
            document.getElementById('pageContainer').innerHTML = content;
            
            // Initialize page-specific functionality
            this.initializePage(pageId);
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('pageContainer').innerHTML = '<div class="container"><h2>পৃষ্ঠা লোড করতে সমস্যা হয়েছে</h2></div>';
        }
    }

    initializePage(pageId) {
        switch(pageId) {
            case 'apply':
                this.setupApplicationForm();
                break;
            case 'donate':
                this.setupDonationForm();
                break;
            case 'volunteer':
                this.setupVolunteerForm();
                break;
            case 'setup':
                this.setupSetupPage();
                break;
        }
    }

    setupApplicationForm() {
        const form = document.getElementById('applicationForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.submitApplication();
            };
        }
    }

    setupDonationForm() {
        const form = document.getElementById('donationForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.submitDonation();
            };
        }
    }

    setupVolunteerForm() {
        const form = document.getElementById('volunteerForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                this.submitVolunteer();
            };
        }
    }

    setupSetupPage() {
        const scriptUrlInput = document.getElementById('scriptUrl');
        if (scriptUrlInput) {
            scriptUrlInput.value = CONFIG.GOOGLE_SHEETS.SCRIPT_URL;
        }
    }

    async submitApplication() {
        const formData = {
            name: document.getElementById('applyName').value,
            phone: document.getElementById('applyPhone').value,
            address: document.getElementById('applyAddress').value,
            type: document.getElementById('applyType').value,
            amount: document.getElementById('applyAmount').value,
            details: document.getElementById('applyDetails').value
        };

        if (!this.validateForm(formData)) {
            this.showAlert('applyAlert', 'দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন', 'error');
            return;
        }

        this.setLoading('applyBtn', true);

        try {
            const result = await this.db.submitApplication(formData);
            
            if (result.status === 'success') {
                this.showAlert('applyAlert', 'আবেদন সফলভাবে জমা হয়েছে!', 'success');
                const form = document.getElementById('applicationForm');
                if (form) form.reset();
            } else {
                console.error(result);
                this.showAlert('applyAlert', 'ত্রুটি হয়েছে, পরে চেষ্টা করুন', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showAlert('applyAlert', 'নেটওয়ার্ক ত্রুটি', 'error');
        } finally {
            this.setLoading('applyBtn', false);
        }
    }

    async submitDonation() {
        const formData = {
            name: document.getElementById('donateName').value,
            phone: document.getElementById('donatePhone').value,
            type: document.getElementById('donateType').value,
            amount: document.getElementById('donateAmount').value,
            details: document.getElementById('donateDetails').value,
            method: document.querySelector('input[name="donateMethod"]:checked')?.value
        };

        if (!this.validateForm(formData, ['name', 'phone'])) {
            this.showAlert('donateAlert', 'দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন', 'error');
            return;
        }

        this.setLoading('donateBtn', true);

        try {
            const result = await this.db.submitDonation(formData);
            
            if (result.status === 'success') {
                this.showAlert('donateAlert', 'দানের তথ্য সফলভাবে জমা হয়েছে!', 'success');
                const form = document.getElementById('donationForm');
                if (form) form.reset();
            } else {
                console.error(result);
                this.showAlert('donateAlert', 'ত্রুটি হয়েছে, পরে চেষ্টা করুন', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showAlert('donateAlert', 'নেটওয়ার্ক ত্রুটি', 'error');
        } finally {
            this.setLoading('donateBtn', false);
        }
    }

    async submitVolunteer() {
        const helpTypes = Array.from(document.querySelectorAll('#volunteerForm input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        const formData = {
            name: document.getElementById('volunteerName').value,
            phone: document.getElementById('volunteerPhone').value,
            address: document.getElementById('volunteerAddress').value,
            occupation: document.getElementById('volunteerOccupation').value,
            helpTypes: helpTypes.join(', '),
            hours: document.getElementById('volunteerHours').value,
            extra: document.getElementById('volunteerExtra').value
        };

        if (!this.validateForm(formData) || helpTypes.length === 0) {
            this.showAlert('volunteerAlert', 'দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন', 'error');
            return;
        }

        this.setLoading('volunteerBtn', true);

        try {
            const result = await this.db.submitVolunteer(formData);
            
            if (result.status === 'success') {
                this.showAlert('volunteerAlert', 'স্বেচ্ছাসেবক আবেদন সফলভাবে জমা হয়েছে!', 'success');
                const form = document.getElementById('volunteerForm');
                if (form) form.reset();
            } else {
                console.error(result);
                this.showAlert('volunteerAlert', 'ত্রুটি হয়েছে, পরে চেষ্টা করুন', 'error');
            }
        } catch (error) {
            console.error(error);
            this.showAlert('volunteerAlert', 'নেটওয়ার্ক ত্রুটি', 'error');
        } finally {
            this.setLoading('volunteerBtn', false);
        }
    }

    validateForm(data, optionalFields = []) {
        for (const [key, value] of Object.entries(data)) {
            if (!optionalFields.includes(key) && (!value || value.toString().trim() === '')) {
                return false;
            }
        }
        return true;
    }

    setLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (isLoading) {
                button.disabled = true;
                button.innerHTML = '<span class="loading"></span> প্রক্রিয়াকরণ হচ্ছে...';
            } else {
                button.disabled = false;
                // Reset button text based on buttonId
                if (buttonId === 'applyBtn') {
                    button.innerHTML = '<i class="fas fa-paper-plane"></i> আবেদন জমা দিন';
                } else if (buttonId === 'donateBtn') {
                    button.innerHTML = '<i class="fas fa-hand-holding-heart"></i> দান জমা দিন';
                } else if (buttonId === 'volunteerBtn') {
                    button.innerHTML = '<i class="fas fa-user-plus"></i> স্বেচ্ছাসেবক নিবন্ধন';
                }
            }
        }
    }

    showAlert(alertId, message, type) {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.textContent = message;
            alert.className = `alert alert-${type} show`;
            
            setTimeout(() => {
                alert.classList.remove('show');
            }, 5000);
        }
    }

    async loadStats() {
        try {
            const result = await this.db.getStatistics();
            
            if (result.status === 'success') {
                this.updateStatsDisplay(result.data);
            } else {
                console.error(result);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(data) {
        const elements = {
            'totalApplications': data.totalApplications || '0',
            'totalDonations': (data.totalDonations || 0) + ' টাকা',
            'totalVolunteers': data.totalVolunteers || '0',
            'successRate': data.successRate || '0%'
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }

        // Update progress bar
        const currentAmount = parseInt(data.totalDonations) || 0;
        const goalAmount = 500000;
        const progressPercent = Math.min((currentAmount / goalAmount) * 100, 100);
        
        const progressFill = document.getElementById('goalProgress');
        const currentAmountElement = document.getElementById('currentAmount');
        
        if (progressFill) progressFill.style.width = `${progressPercent}%`;
        if (currentAmountElement) currentAmountElement.textContent = currentAmount.toLocaleString('bn-BD');
    }

    toggleMenu() {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    }

    saveScriptUrl() {
        const url = document.getElementById('scriptUrl').value;
        if (url && url.includes('google.com')) {
            CONFIG.GOOGLE_SHEETS.SCRIPT_URL = url;
            localStorage.setItem('korjeHasanaScriptUrl', url);
            this.showAlert('setupAlert', 'Script URL সফলভাবে সেভ হয়েছে!', 'success');
        } else {
            this.showAlert('setupAlert', 'দয়া করে একটি বৈধ Google Apps Script URL দিন', 'error');
        }
    }

    async testConnection() {
        try {
            const result = await this.db.getStatistics();
            
            if (result.status === 'success') {
                this.showAlert('setupAlert', 'সংযোগ সফল! ডাটাবেজের সাথে সংযুক্ত হয়েছে।', 'success');
            } else {
                this.showAlert('setupAlert', 'সংযোগ ব্যর্থ। দয়া করে Script URL চেক করুন।', 'error');
            }
        } catch (error) {
            this.showAlert('setupAlert', 'সংযোগ ব্যর্থ। দয়া করে Script URL চেক করুন।', 'error');
        }
    }
}

// Initialize the application
const app = new KorjeHasanaApp();
        
