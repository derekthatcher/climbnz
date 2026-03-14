document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getStats" }, (response) => {
        if (!response || response.error) return;
        console.log(response);
        // 1. Data Processing
        const fixedLabels = [];
        for (let i = 10; i <= 35; i++) { fixedLabels.push(i.toString()); }

        let totalClimbs = 0;
        const counts = fixedLabels.map(label => {
            let count = 0;
            for (const [grade, val] of Object.entries(response.gradeCounts)) {
                if (parseInt(grade) === parseInt(label)) count += val;
            }
            totalClimbs += count;
            return count;
        });

        // 2. UI Updates
        document.getElementById('avg-grade').textContent = response.avgGrade;
        document.getElementById('avg-quality').textContent = `${response.avgQuality}`;

        // 3. Chart Rendering
        const barColors = fixedLabels.map(label => {
            const g = parseInt(label);
            if (g < 20) return '#48bb78'; // Modern Green
            if (g <= 24) return '#ed8936'; // Modern Orange
            if (g <= 29) return '#f56565'; // Modern Red
            return '#9f7aea';             // Modern Purple
        });

        const ctx = document.getElementById('gradeChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: fixedLabels,
                datasets: [{
                    data: counts,
                    backgroundColor: barColors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: `${response.cragName} (${totalClimbs} Routes)`,
                        font: { size: 16, weight: '600' },
                        color: '#2d3748'
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

        // 4. Download Logic
        document.getElementById('download-btn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `${response.cragName.replace(/\s+/g, '_')}_Stats.png`;
            link.href = document.getElementById('gradeChart').toDataURL("image/png", 1.0);
            link.click();
        });
    });
});