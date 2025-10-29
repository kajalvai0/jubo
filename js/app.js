// Main Application Logic
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
                document.getElementById('applicationForm').reset();
            } else {
                this.showAlert('applyAlert', 'ত্রুটি হয়েছে, পরে চেষ্টা করুন', 'error');
            }
        } catch (error) {
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
                document.getElementById('donationForm').reset();
            } else {
                this.showAlert('donateAlert', 'ত্রুটি হয়েছে, পরে চেষ্টা করুন', 'error');
            }
        } catch (error) {
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
                document.getElementById('volunteerForm').reset();
            } else {
                this.showAlert('volunteerAlert', 'ত্রুটি হয়েছে, পরে চেষ্টা করুন', 'error');
            }
        } catch (error) {
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
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(data) {
        const elements = {
            'totalApplications': data.totalApplications || '0',
            'totalDonations': (data.totalDonations || '0') + ' টাকা',
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
