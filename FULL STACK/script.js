// Helper function for selecting elements
const select = (el, all = false) => {
    el = el.trim();
    if (all) {
        return [...document.querySelectorAll(el)];
    } else {
        return document.querySelector(el);
    }
};

// Helper function for adding event listeners
const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
        if (all) {
            selectEl.forEach(e => e.addEventListener(type, listener));
        } else {
            selectEl.addEventListener(type, listener);
        }
    }
};

// Helper function for scroll events
const onScroll = (el, listener) => {
    // Use window for global scroll events unless a specific element is intended
    const target = (el === document || el === window) ? window : el;
    target.addEventListener('scroll', listener);
};

// --- Mobile Menu Toggle ---
const mobileMenuButton = select('.mobile-menu');
const navLinks = select('.nav-links');
const mobileMenuIcon = select('.mobile-menu i');

if (mobileMenuButton && navLinks && mobileMenuIcon) {
    on('click', '.mobile-menu', function(e) {
        navLinks.classList.toggle('show');
        mobileMenuIcon.classList.toggle('fa-bars');
        mobileMenuIcon.classList.toggle('fa-times');
        mobileMenuButton.setAttribute('aria-expanded', navLinks.classList.contains('show'));

        // Adjust top position based on header height when menu opens
        const headerHeight = select('#header')?.offsetHeight || 61; // Fallback height
        navLinks.style.top = `${headerHeight}px`;
    });

    // Close mobile menu when a link is clicked
    on('click', '.nav-links a', function(e) {
        if (navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            mobileMenuIcon.classList.remove('fa-times');
            mobileMenuIcon.classList.add('fa-bars');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
        // CSS handles smooth scroll via html { scroll-behavior: smooth; }
    }, true);
}

// --- Header Scroll Effect ---
const header = select('#header');
if (header) {
    const headerScrolled = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('load', headerScrolled);
    onScroll(window, headerScrolled); // Listen on window for scroll
}

// --- Back to Top Button ---
const backToTopButton = select('.back-to-top');
if (backToTopButton) {
    const toggleBackToTop = () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    };
    window.addEventListener('load', toggleBackToTop);
    onScroll(window, toggleBackToTop); // Listen on window for scroll

    on('click', '.back-to-top', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- Chart.js Implementation ---
// IMPORTANT: Wrap ALL chart code in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {

    // Check if Chart object and Annotation plugin object exist
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not loaded or loaded after this script.");
        return; // Stop execution if Chart is not available
    }
    if (typeof ChartAnnotation === 'undefined') {
        console.error("Chartjs-plugin-annotation not loaded or loaded after this script.");
        // Decide if you want to proceed without annotations or stop
        // return; // Uncomment this to stop if annotations are critical
    }

    // *** CRUCIAL STEP: Register the annotation plugin ***
    // This MUST happen after both libraries are loaded but before creating charts
    try {
        if (typeof ChartAnnotation !== 'undefined') {
             Chart.register(ChartAnnotation);
             console.log("Chartjs-plugin-annotation registered successfully.");
        }
    } catch (error) {
        console.error("Error registering Chartjs-plugin-annotation:", error);
        // Decide how to handle this - maybe proceed without annotations?
    }


    // --- Common Chart Configuration ---
    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 12, // Slightly larger for clarity
                    boxHeight: 12,
                    padding: 10, // Increased padding
                    font: { size: 11 }, // Slightly larger font
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.dataset.label === 'Divergence') return null;
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(1) + '%';
                        }
                        return label;
                    }
                },
                bodyFont: { size: window.innerWidth <= 768 ? 11 : 12 },
                backgroundColor: 'rgba(0,0,0,0.8)', // Darker tooltip
                titleFont: { size: 13, weight: 'bold' }, // Bold title
                padding: 10,
                cornerRadius: 4,
                displayColors: false // Hide color boxes in tooltip for cleaner look
            },
            // Annotation plugin configuration is added per-chart below
            annotation: { // Default structure expected by plugin
                annotations: {}
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    font: { size: window.innerWidth <= 768 ? 10 : 12 },
                    color: '#6c757d' // Muted color for ticks
                 }
            },
            y: {
                beginAtZero: false, // Adjust if needed based on data range
                title: {
                    display: true,
                    text: 'Growth Rate (%)',
                    font: { size: window.innerWidth <= 768 ? 11 : 12, weight: '500' }, // Medium weight
                    color: '#495057' // Text color
                },
                ticks: {
                    callback: function(value) { return value + '%'; },
                    font: { size: window.innerWidth <= 768 ? 10 : 11 },
                    color: '#6c757d' // Muted color for ticks
                },
                grid: {
                    drawBorder: false,
                    color: 'rgba(0, 0, 0, 0.05)' // Lighter grid lines
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        layout: {
            padding: { // Consistent padding
                top: 20,
                right: 20,
                bottom: 10,
                left: 10
            }
        }
    };

    // --- Chart Data ---
    const labels = ['FY2020', 'FY2021', 'FY2022', 'FY2023', 'FY2024'];
    const revenueGrowthData = [29.3, 27.6, 9.9, 3.7, 6.8];
    const arGrowthData = [15.0, 18.2, 53.6, -16.1, 35.6];
    const cfoGrowthData = [71.7, -0.6, 36.7, 2.9, -1.0];
    const niGrowthData = [305.4, -107.2, 3.9, 1.3, 71.1];
    const divergenceColor = '#f44336'; // var(--danger)
    const primaryColor = '#c5a47e';    // var(--primary)
    const secondaryColor = '#1c2541';  // var(--secondary)
    const mutedColor = '#6c757d';      // var(--muted)

    // --- Helper Functions for Chart Styling ---
    const createAnnotationLabel = (xVal, yVal, content, yAdj = -15, xAdj = 0) => ({
        type: 'label',
        xValue: xVal,
        yValue: yVal,
        content: content,
        color: mutedColor,
        font: { size: window.innerWidth <= 768 ? 9 : 10, weight: '600' }, // Slightly bolder
        position: 'start',
        yAdjust: yAdj, // Use passed value directly
        xAdjust: xAdj, // Add xAdjust
        backgroundColor: 'rgba(255,255,255,0.85)', // Slightly less transparent
        padding: { top: 3, bottom: 3, left: 5, right: 5 }, // More control over padding
        borderRadius: 4,
        callout: { // Optional: Add a small pointer
            display: true,
            position: 'bottom',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            margin: 5 // Distance from label to point
        }
    });

    const createDivergenceLegend = () => ({
        label: 'Divergence',
        // Use pointStyle for the legend item itself
        pointStyle: 'rectRot', // Use a rotated square (diamond) for divergence
        pointRadius: 5,        // Make the legend point visible
        borderColor: divergenceColor, // Use divergence color for the point border
        backgroundColor: divergenceColor, // Use divergence color for the point fill
        borderWidth: 1,
        data: [] // No actual line data
    });

    const pointStyleCallback = (indices, normalColor, highlightColor) => (context) => {
        return indices.includes(context.dataIndex) ? highlightColor : normalColor;
    };

    const pointRadiusCallback = (indices, normalRadius = 4, highlightRadius = 6) => (context) => { // Increased highlight radius
        return indices.includes(context.dataIndex) ? highlightRadius : normalRadius;
    };

    const pointHoverRadiusCallback = (indices, normalRadius = 6, highlightRadius = 8) => (context) => { // Increased hover radius
        return indices.includes(context.dataIndex) ? highlightRadius : normalRadius;
    };

    // --- Chart Initialization ---

    // 1. Revenue Chart
    const revenueCtx = select('#revenueChart')?.getContext('2d');
    if (revenueCtx) {
        try {
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Annual Revenue Growth (%)',
                        data: revenueGrowthData,
                        borderColor: primaryColor,
                        backgroundColor: 'rgba(197, 164, 126, 0.1)',
                        borderWidth: 2.5, // Slightly thicker line
                        tension: 0.4, // Smoother curve
                        fill: true,
                        pointBackgroundColor: primaryColor,
                        pointRadius: pointRadiusCallback([]), // Use callback even if no highlights
                        pointHoverRadius: pointHoverRadiusCallback([]),
                        pointBorderColor: primaryColor // Ensure border matches
                    }]
                },
                options: commonChartOptions // Use common options directly
            });
            console.log("Revenue chart initialized.");
        } catch (error) {
            console.error("Error initializing Revenue Chart:", error);
        }
    } else {
        console.warn("Canvas element #revenueChart not found.");
    }

    // 2. Accounts Receivable vs Revenue Chart
    const arCtx = select('#arChart')?.getContext('2d');
    if (arCtx) {
        try {
            const arDivergenceIndices = [2, 4];
            // Deep clone common options to avoid mutation issues between charts
            const arChartOptions = JSON.parse(JSON.stringify(commonChartOptions));
            // Add specific annotations for this chart
            arChartOptions.plugins.annotation = {
                annotations: {
                    label1: createAnnotationLabel(2, 53.6, ['A/R Spike', '(FY22)'], -20), // Adjust Y offset
                    label2: createAnnotationLabel(4, 35.6, ['A/R Spike', '(FY24)'], -20)  // Adjust Y offset
                }
            };

            new Chart(arCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Revenue Growth (%)',
                            data: revenueGrowthData,
                            borderColor: primaryColor,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.4,
                            pointBackgroundColor: primaryColor,
                            pointRadius: pointRadiusCallback([]),
                            pointHoverRadius: pointHoverRadiusCallback([]),
                            pointBorderColor: primaryColor
                        },
                        {
                            label: 'A/R Growth (%)',
                            data: arGrowthData,
                            borderColor: secondaryColor,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.4,
                            pointBackgroundColor: pointStyleCallback(arDivergenceIndices, secondaryColor, divergenceColor),
                            pointRadius: pointRadiusCallback(arDivergenceIndices),
                            pointHoverRadius: pointHoverRadiusCallback(arDivergenceIndices),
                            pointBorderColor: pointStyleCallback(arDivergenceIndices, secondaryColor, divergenceColor) // Match border
                        },
                        createDivergenceLegend()
                    ]
                },
                options: arChartOptions // Use the modified options
            });
            console.log("A/R chart initialized.");
        } catch (error) {
            console.error("Error initializing A/R Chart:", error);
        }
    } else {
        console.warn("Canvas element #arChart not found.");
    }

    // 3. Operating Cash Flow vs Net Income Chart
    const cashFlowCtx = select('#cashFlowChart')?.getContext('2d');
    if (cashFlowCtx) {
        try {
            const cfDivergenceIndices = [4];
            // Deep clone common options
            const cashFlowChartOptions = JSON.parse(JSON.stringify(commonChartOptions));
            // Add specific annotations
            cashFlowChartOptions.plugins.annotation = {
                annotations: {
                    label1: createAnnotationLabel(4, -1.0, ['CFO Decline', '(FY24)'], 25) // Adjust Y offset further up
                }
            };

            new Chart(cashFlowCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Op Cash Flow Growth (%)',
                            data: cfoGrowthData,
                            borderColor: primaryColor,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.4,
                            pointBackgroundColor: primaryColor,
                            pointRadius: pointRadiusCallback([]),
                            pointHoverRadius: pointHoverRadiusCallback([]),
                            pointBorderColor: primaryColor
                        },
                        {
                            label: 'Net Income Growth (%)',
                            data: niGrowthData,
                            borderColor: secondaryColor,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            tension: 0.4,
                            pointBackgroundColor: pointStyleCallback(cfDivergenceIndices, secondaryColor, divergenceColor),
                            pointRadius: pointRadiusCallback(cfDivergenceIndices),
                            pointHoverRadius: pointHoverRadiusCallback(cfDivergenceIndices),
                            pointBorderColor: pointStyleCallback(cfDivergenceIndices, secondaryColor, divergenceColor) // Match border
                        },
                        createDivergenceLegend()
                    ]
                },
                options: cashFlowChartOptions // Use the modified options
            });
            console.log("Cash Flow chart initialized.");
        } catch (error) {
            console.error("Error initializing Cash Flow Chart:", error);
        }
    } else {
        console.warn("Canvas element #cashFlowChart not found.");
    }

    // --- Responsive Chart Adjustments ---
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const isMobile = window.innerWidth <= 768;
            const charts = Chart.instances;

            for (const id in charts) {
                const chart = charts[id];
                if (!chart) continue; // Skip if chart instance is null/undefined

                // Adjust font sizes
                if (chart.options.plugins?.tooltip?.bodyFont) chart.options.plugins.tooltip.bodyFont.size = isMobile ? 11 : 12;
                if (chart.options.scales?.x?.ticks?.font) chart.options.scales.x.ticks.font.size = isMobile ? 10 : 12;
                if (chart.options.scales?.y?.title?.font) chart.options.scales.y.title.font.size = isMobile ? 11 : 12;
                if (chart.options.scales?.y?.ticks?.font) chart.options.scales.y.ticks.font.size = isMobile ? 10 : 11;

                // Adjust layout padding (use consistent padding defined above)
                // chart.options.layout.padding = { top: 20, right: 20, bottom: 10, left: 10 };

                // Adjust annotation label font size dynamically
                if (chart.options.plugins?.annotation?.annotations) {
                    Object.values(chart.options.plugins.annotation.annotations).forEach(anno => {
                        if (anno.type === 'label' && anno.font) {
                            anno.font.size = isMobile ? 9 : 10;
                            // Re-apply yAdjust logic if it needs to be dynamic based on size
                            // Example: anno.yAdjust = isMobile ? anno._initialYAdjustMobile : anno._initialYAdjustDesktop;
                        }
                    });
                }

                try {
                    chart.resize();
                    chart.update('none'); // Update without animation
                } catch(error) {
                    console.error(`Error resizing/updating chart ${id}:`, error);
                }
            }
            console.log("Charts resized/updated.");
        }, 250); // Debounce resize event
    };

    window.addEventListener('resize', handleResize);

    // Optional: Initial call to handleResize if needed, though DOMContentLoaded should suffice
    // handleResize();

}); // End DOMContentLoaded Wrapper
