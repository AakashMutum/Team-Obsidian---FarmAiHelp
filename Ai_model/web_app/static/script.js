// DOM Elements
const predictionForm = document.getElementById('predictionForm');
const resultsSection = document.getElementById('results');
const recommendedCropElement = document.getElementById('recommendedCrop');
const expectedYieldElement = document.getElementById('expectedYield');
const totalCostElement = document.getElementById('totalCost');
const expectedRevenueElement = document.getElementById('expectedRevenue');
const projectedProfitElement = document.getElementById('projectedProfit');
const roiElement = document.getElementById('roi');

// Form submission handler
predictionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value),
        area: parseFloat(document.getElementById('area').value),
        soil_data: {
            soil_type: document.getElementById('soil_type').value
        }
    };

    try {
        // Send prediction request
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Prediction request failed');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while making the prediction. Please try again.');
    }
});

// Display prediction results
function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';

    // Update recommended crop
    recommendedCropElement.textContent = data.recommended_crop;

    // Update profitability analysis
    const profitability = data.profitability_analysis;
    expectedYieldElement.textContent = profitability.estimated_yield.toFixed(2);
    totalCostElement.textContent = profitability.total_cost.toFixed(2);
    expectedRevenueElement.textContent = profitability.expected_revenue.toFixed(2);
    projectedProfitElement.textContent = profitability.projected_profit.toFixed(2);
    roiElement.textContent = (profitability.roi * 100).toFixed(2);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Format currency values
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Input validation
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);

        if (e.target.hasAttribute('min') && value < min) {
            e.target.value = min;
        }
        if (e.target.hasAttribute('max') && value > max) {
            e.target.value = max;
        }
    });
});