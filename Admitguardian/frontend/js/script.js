document.addEventListener('DOMContentLoaded', function() {
    // Initialize Risk Chart
    const riskChart = new Chart(
        document.getElementById('riskChart'),
        {
            type: 'doughnut',
            data: {
                labels: ['Essay Risk', 'Resume Risk', 'Remaining'],
                datasets: [{
                    data: [65, 78, 57],
                    backgroundColor: [
                        'rgba(0, 168, 204, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(240, 240, 240, 0.8)'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        }
    );

    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Checklist Toggle
    const checkToggles = document.querySelectorAll('.check-toggle');

    checkToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const item = this.closest('.checklist-item');
            item.classList.toggle('completed');
            updateProgress();
        });
    });

    function updateProgress() {
        const totalItems = document.querySelectorAll('.checklist-item').length;
        const completedItems = document.querySelectorAll('.checklist-item.completed').length;
        const progressPercentage = (completedItems / totalItems) * 100;

        document.querySelector('.progress-fill').style.width = `${progressPercentage}%`;
        document.querySelector('.progress-tracker span').textContent = `${completedItems}/${totalItems}`;
    }

    // Download Checklist
    document.getElementById('downloadChecklist').addEventListener('click', function() {
        const checklistItems = Array.from(document.querySelectorAll('.checklist-item')).map(item => {
            const priority = item.querySelector('.item-priority').textContent;
            const title = item.querySelector('h3').textContent;
            const description = item.querySelector('p').textContent;
            const completed = item.classList.contains('completed') ? '[✓]' : '[ ]';

            return `${completed} ${priority}: ${title} - ${description}`;
        }).join('\n\n');

        const blob = new Blob([checklistItems], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admitguardian_checklist.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const dashboardHeader = document.querySelector('.dashboard-header');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            dashboardHeader.classList.toggle('mobile-visible');
        });
    }

    // Responsive Chart Resizing
    function handleResize() {
        riskChart.resize();
    }

    window.addEventListener('resize', handleResize);
});