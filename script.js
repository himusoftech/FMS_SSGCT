function doGet() {
  var feedbackData = getFeedbackData();
  console.log("✅ Sending Data:", JSON.stringify(feedbackData));
  
  return ContentService.createTextOutput(JSON.stringify({ feedback: feedbackData }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fetch feedback data from the "Feedback" sheet
function getFeedbackData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Feedback");
  if (!sheet) {
    Logger.log("❌ ERROR: 'Feedback' sheet NOT found!");
    return [];
  }

  var data = sheet.getDataRange().getValues();
  Logger.log("✅ Raw Data Retrieved: " + JSON.stringify(data));

  if (!data || data.length <= 1) {
    Logger.log("⚠️ No feedback data available.");
    return [];
  }

  data.shift(); // Remove headers
  Logger.log("✅ Processed Feedback Data: " + JSON.stringify(data));
  
  return data;  // 🔴 Ensure this function RETURNS the data!
}


function testSheetAccess() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Feedback");
  if (!sheet) {
    Logger.log("❌ ERROR: 'Feedback' sheet NOT found!");
    return;
  }

  var data = sheet.getDataRange().getValues();
  Logger.log("✅ SUCCESS: Sheet found! Total Rows: " + data.length);
  Logger.log("🔍 DATA PREVIEW: " + JSON.stringify(data.slice(0, 5))); // First 5 rows
}
function testGetFeedbackData() {
    var data = getFeedbackData();
    Logger.log("🔍 Test Data Output: " + JSON.stringify(data));
}

// Fetch assignee names from the "Management" sheet
function getAssigneeNames() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Management");
  var data = sheet.getDataRange().getValues();
  var names = [];

  for (var i = 1; i < data.length; i++) {
    names.push(data[i][0]); // Assuming the name is in Column A
  }

  return names;
}

// Assign feedback to a person
function assignFeedback(refNum, assigneeName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Feedback");
  var data = sheet.getDataRange().getValues();
  var managementSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Management");
  var managementData = managementSheet.getDataRange().getValues();

  var assigneeEmail = "";

  // Find the assignee's email
  for (var i = 1; i < managementData.length; i++) {
    if (managementData[i][0] === assigneeName) { // Assuming Name is in Column A
      assigneeEmail = managementData[i][1]; // Assuming Email is in Column B
      break;
    }
  }

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === refNum) {
      sheet.getRange(i + 1, 8).setValue(assigneeName);
      sheet.getRange(i + 1, 7).setValue("In Process");

      // Send email to assigned person
      if (assigneeEmail) {
        var subject = "New Feedback Assigned - " + refNum;
        var body = "Dear " + assigneeName + ",\n\n" +
                   "You have been assigned the following feedback:\n" +
                   "Reference No: " + refNum + "\n" +
                   "Please review and provide a resolution.\n\n" +
                   "Regards,\nFMS-SSGT";
        MailApp.sendEmail(assigneeEmail, subject, body);
      }

      return "Feedback assigned successfully.";
    }
  }
  return "Feedback not found.";
}
