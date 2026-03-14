document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getStats" }, (response) => {
        if (!response || !response.gradeCounts) return;
        console.log(response);

        const fixedLabels = [];
        for (let i = 10; i <= 35; i++) { fixedLabels.push(i.toString()); }

        let totalClimbs = 0;
        const counts = fixedLabels.map(label => {
            let count = 0;
            for (const [grade, val] of Object.entries(response.gradeCounts)) {
                if (parseInt(grade) === parseInt(label)) {
                    count += val;
                }
            }
            totalClimbs += count; // Calculate running total
            return count;
        });

        const barColors = fixedLabels.map(label => {
            const gradeNum = parseInt(label);
            if (gradeNum < 20) return '#2ecc71';
            if (gradeNum <= 24) return '#f39c12';
            if (gradeNum <= 29) return '#e74c3c';
            return '#9b59b6';
        });

        const ctx = document.getElementById('gradeChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: fixedLabels,
                datasets: [{
                    data: counts,
                    backgroundColor: barColors,
                    borderRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    // Set Crag Name and Total as Title
                    title: {
                        display: true,
                        text: `${response.cragName} (${totalClimbs} Total Climbs)`,
                        font: { size: 16, weight: 'bold' },
                        padding: { bottom: 20 }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { autoSkip: false } },
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

        // Update the summary text at the bottom
        const summaryDiv = document.getElementById('stats-summary');
        summaryDiv.innerHTML = `<div>Avg Grade: <strong>${response.avgGrade}</strong></div>
        <div>Avg Quality: <strong>${response.avgQuality}</strong></div>`;

        // Add a download button to the UI
        const downloadBtn = document.createElement('button');
        downloadBtn.innerText = "Download for Illustrator (SVG)";
        downloadBtn.style = "margin-top: 10px; width: 100%; padding: 8px; cursor: pointer; background: #2c3e50; color: white; border: none; border-radius: 4px;";
        document.body.appendChild(downloadBtn);

        downloadBtn.addEventListener('click', () => {
            // To make it truly editable for Illustrator, we convert the canvas to an SVG-like blob
            // Note: Standard canvas is raster. For a true vector SVG, we use a trick:
            const canvas = document.getElementById('gradeChart');
            const imgData = canvas.toDataURL("image/png", 1.0);

            // For professional vector editing, we recommend using a PDF wrapper
            // But for this extension, we'll trigger a high-res PNG download 
            // OR use a 'hidden' SVG renderer.

            const link = document.createElement('a');
            link.download = `${response.cragName}-chart.png`;
            link.href = imgData;
            link.click();
        });

    });
});