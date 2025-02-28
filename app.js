const usdInput = document.getElementById('usd');
const brlInput = document.getElementById('brl');

// Replace with your API key
const API_KEY = 'YOUR_API_KEY';

// Format number for USD (1,234)
function formatUSD(number) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(number);
}

// Format number for BRL (1.234)
function formatBRL(number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(number);
}

// Parse formatted number string back to number
function parseFormattedNumber(str) {
    if (!str) return 0;
    // Remove all non-numeric characters
    const cleanStr = str.replace(/[^0-9]/g, '');
    return cleanStr ? parseInt(cleanStr) : 0;
}

// Fetch current exchange rate
async function getExchangeRate() {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        return data.rates.BRL;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        return 5.04; // Fallback rate if API fails
    }
}

let currentRate;

// Get initial rate
getExchangeRate().then(rate => {
    currentRate = rate;
});

// Handle USD input
usdInput.addEventListener('input', () => {
    const usdAmount = parseFormattedNumber(usdInput.value);
    
    if (usdAmount === 0) {
        usdInput.value = '';
        brlInput.value = '';
    } else {
        const brlAmount = Math.round(usdAmount * currentRate);
        usdInput.value = formatUSD(usdAmount);
        brlInput.value = formatBRL(brlAmount);
    }
});

// Handle BRL input
brlInput.addEventListener('input', () => {
    const brlAmount = parseFormattedNumber(brlInput.value);
    
    if (brlAmount === 0) {
        brlInput.value = '';
        usdInput.value = '';
    } else {
        const usdAmount = Math.round(brlAmount / currentRate);
        brlInput.value = formatBRL(brlAmount);
        usdInput.value = formatUSD(usdAmount);
    }
});

// Update rate every hour
setInterval(() => {
    getExchangeRate().then(rate => {
        currentRate = rate;
    });
}, 3600000); 