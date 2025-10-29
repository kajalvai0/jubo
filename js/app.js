// Google Apps Script for Korje Hasana
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    const spreadsheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
    let sheet, result;
    
    switch(action) {
      case 'submitApplication':
        sheet = spreadsheet.getSheetByName('Applications');
        result = addApplication(sheet, data);
        break;
      case 'submitDonation':
        sheet = spreadsheet.getSheetByName('Donations');
        result = addDonation(sheet, data);
        break;
      case 'submitVolunteer':
        sheet = spreadsheet.getSheetByName('Volunteers');
        result = addVolunteer(sheet, data);
        break;
      default:
        result = {status: 'error', message: 'Invalid action'};
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimetype(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimetype(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getStats') {
    const stats = getStatistics();
    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: stats}))
      .setMimetype(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid action'}))
    .setMimetype(ContentService.MimeType.JSON);
}

function addApplication(sheet, data) {
  const row = [
    new Date(),
    data.name,
    data.phone,
    data.address,
    data.type,
    data.amount,
    data.details,
    'Pending'
  ];
  sheet.appendRow(row);
  return {status: 'success', message: 'Application submitted'};
}

function addDonation(sheet, data) {
  const row = [
    new Date(),
    data.name || 'Anonymous',
    data.phone || 'N/A',
    data.type,
    data.amount,
    data.method,
    data.details || 'N/A'
  ];
  sheet.appendRow(row);
  return {status: 'success', message: 'Donation recorded'};
}

function addVolunteer(sheet, data) {
  const row = [
    new Date(),
    data.name,
    data.phone,
    data.address,
    data.occupation,
    data.helpTypes,
    data.hours,
    data.extra || 'N/A',
    'Pending'
  ];
  sheet.appendRow(row);
  return {status: 'success', message: 'Volunteer application submitted'};
}

function getStatistics() {
  const spreadsheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  const applicationsSheet = spreadsheet.getSheetByName('Applications');
  const donationsSheet = spreadsheet.getSheetByName('Donations');
  const volunteersSheet = spreadsheet.getSheetByName('Volunteers');
  
  const totalApplications = applicationsSheet.getLastRow() - 1;
  const totalVolunteers = volunteersSheet.getLastRow() - 1;
  
  let totalDonations = 0;
  const donationData = donationsSheet.getRange(2, 5, donationsSheet.getLastRow() - 1, 1).getValues();
  donationData.forEach(row => {
    totalDonations += parseFloat(row[0]) || 0;
  });
  
  const successRate = Math.round((totalApplications / (totalApplications + 10)) * 100);
  
  return {
    totalApplications: totalApplications,
    totalDonations: totalDonations,
    totalVolunteers: totalVolunteers,
    successRate: successRate + '%'
  };
      }
