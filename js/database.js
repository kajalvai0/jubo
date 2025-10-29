// SheetDB API Implementation
class SheetDB {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async submitApplication(data) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
                  }
