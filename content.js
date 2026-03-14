function getGradeData() {
    const rows = document.querySelectorAll('table.views-table tbody tr');
    // Grab the crag name from the H1 tag
    const cragName = document.querySelector('h1')?.innerText.trim() || "Unknown Crag";
    
    let gradeCounts = {};
    let totalQuality = 0;
    let qCount = 0;

    let totalGradeSum = 0;
    let gradeCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;

        const grade = cells[2].innerText.trim();
        const gradeNum = parseInt(grade);
        const quality = parseFloat(cells[5].innerText.replace('Rate', '').trim());

        if (grade && grade !== "-") {
            gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
        }
        // For the Average Grade calculation
        if (!isNaN(gradeNum)) {
            totalGradeSum += gradeNum;
            gradeCount++;
        }
        if (!isNaN(quality)) {
            totalQuality += quality;
            qCount++;
        }
    });

    return {
        cragName: cragName,
        gradeCounts: gradeCounts,
        avgQuality: qCount > 0 ? (totalQuality / qCount).toFixed(2) : "N/A",
        avgGrade: gradeCount > 0 ? (totalGradeSum / gradeCount).toFixed(1) : "N/A"
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getStats") {
        const data = getGradeData(); // Run the scraper
        sendResponse(data);          // Send the object back
    }
    return true; // This is the magic line that keeps the message port open
});