const usdInput = document.getElementById('usd');
const brlInput = document.getElementById('brl');
const clpInput = document.getElementById('clp');
const btcInput = document.getElementById('btc');
const ethInput = document.getElementById('eth');

// Fetch current exchange rates
async function getExchangeRates() {
    try {
        // Fetch fiat rates from Open Exchange Rates
        const fiatResponse = await fetch('https://open.er-api.com/v6/latest/USD');
        const fiatData = await fiatResponse.json();
        
        // Fetch crypto rates from Binance
        const [btcResponse, ethResponse] = await Promise.all([
            fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
            fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
        ]);
        
        const btcData = await btcResponse.json();
        const ethData = await ethResponse.json();
        
        return {
            BRL: fiatData.rates.BRL,
            CLP: fiatData.rates.CLP,
            BTC: 1 / parseFloat(btcData.price),
            ETH: 1 / parseFloat(ethData.price),
            lastUpdated: Date.now()
        };
    } catch (error) {
        console.error('Error fetching rates:', error);
        return {
            BRL: 4.95,    // Fallback rate
            CLP: 969.50,  // Fallback rate
            BTC: 0.000016, // Fallback rate
            ETH: 0.00031,  // Fallback rate
            lastUpdated: Date.now()
        };
    }
}

let rates;

// Function to format numbers for sharing
function formatForSharing(value, currency) {
    if (currency === 'BTC' || currency === 'ETH') {
        // For BTC and ETH, keep decimals and use dot as decimal point
        return parseFloat(value).toFixed(currency === 'BTC' ? 8 : 6);
    }
    // For USD, BRL, and CLP, no decimals, use comma as thousands separator
    return parseInt(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Use comma as thousands separator
}

// Function to format numbers for display with appropriate decimals
function formatNumber(number, currency) {
    const options = {
        USD: { maximumFractionDigits: 0, minimumFractionDigits: 0 },
        BRL: { maximumFractionDigits: 0, minimumFractionDigits: 0 },
        CLP: { maximumFractionDigits: 0, minimumFractionDigits: 0 },
        BTC: { maximumFractionDigits: 8, minimumFractionDigits: 8 },
        ETH: { maximumFractionDigits: 6, minimumFractionDigits: 6 }
    };

    // Format the number using the specified options
    return new Intl.NumberFormat('en-US', options[currency]).format(number).replace(/,/g, '.'); // Replace comma with dot for decimal
}

// Parse formatted number string back to number
function parseFormattedNumber(str) {
    if (!str) return 0;
    // Remove all non-numeric characters except for the decimal point
    const cleanStr = str.replace(/[^0-9.]/g, ''); // Keep dot for parsing
    return cleanStr ? parseFloat(cleanStr) : 0; // Use parseFloat to handle decimals
}

// Convert from USD to target currency
function fromUSD(amount, currency) {
    return amount * rates[currency];
}

// Convert to USD from source currency
function toUSD(amount, currency) {
    return amount / rates[currency];
}

// Update all inputs based on source input
function updateInputs(sourceInput, value) {
    const inputs = {
        usd: usdInput,
        brl: brlInput,
        clp: clpInput,
        btc: btcInput,
        eth: ethInput
    };

    // Convert source value to USD first
    let usdValue;
    if (sourceInput.id === 'usd') {
        usdValue = value;
    } else {
        usdValue = toUSD(value, sourceInput.id.toUpperCase());
    }

    // Update all other inputs
    for (let [currency, input] of Object.entries(inputs)) {
        if (input !== sourceInput) {
            if (currency === 'usd') {
                input.value = formatNumber(usdValue, 'USD');
            } else {
                input.value = formatNumber(fromUSD(usdValue, currency.toUpperCase()), currency.toUpperCase());
            }
        }
    }
}

// Add event listeners to all inputs
[usdInput, brlInput, clpInput, btcInput, ethInput].forEach(input => {
    input.addEventListener('input', (e) => {
        if (document.activeElement === input) {
            const value = parseFormattedNumber(input.value);
            if (value === 0) {
                // Clear all inputs if value is 0
                [usdInput, brlInput, clpInput, btcInput, ethInput].forEach(inp => inp.value = '');
            } else {
                updateInputs(input, value);
            }
        }
    });
});

// Update rates every 30 minutes (1800000 milliseconds)
function updateRates() {
    getExchangeRates().then(newRates => {
        rates = newRates;
        console.log('Rates updated at:', new Date().toLocaleTimeString());
    });
}

// Initial rates
updateRates();

// Update every 30 minutes
setInterval(updateRates, 1800000);

// Function to generate a shareable URL
function generateShareableURL() {
    const usdValue = formatForSharing(usdInput.value, 'USD');
    const brlValue = formatForSharing(brlInput.value, 'BRL');
    const clpValue = formatForSharing(clpInput.value, 'CLP');
    const btcValue = formatForSharing(btcInput.value, 'BTC');
    const ethValue = formatForSharing(ethInput.value, 'ETH');

    // Create a URL with query parameters
    const baseURL = window.location.href.split('?')[0]; // Get the base URL without query params
    const params = new URLSearchParams({
        usd: usdValue,
        brl: brlValue,
        clp: clpValue,
        btc: btcValue,
        eth: ethValue
    });

    return `${baseURL}?${params.toString()}`;
}

// Add event listener to the share button
document.getElementById('shareButton').addEventListener('click', () => {
    // Check if at least one input has a value
    if (usdInput.value || brlInput.value || clpInput.value || btcInput.value || ethInput.value) {
        const shareableURL = generateShareableURL();
        // Copy the URL to clipboard
        navigator.clipboard.writeText(shareableURL).then(() => {
            alert('Shareable URL copied to clipboard: ' + shareableURL);
        });
    } else {
        alert('Please enter at least one amount to share.');
    }
});

// Function to populate inputs from URL parameters
function populateInputsFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Get values from URL parameters
    const usdValue = params.get('usd') || '';
    const brlValue = params.get('brl') || '';
    const clpValue = params.get('clp') || '';
    const btcValue = params.get('btc') || '';
    const ethValue = params.get('eth') || '';

    // Set the input values
    usdInput.value = usdValue;
    brlInput.value = brlValue;
    clpInput.value = clpValue;
    btcInput.value = btcValue;
    ethInput.value = ethValue;

    // Update all inputs based on the populated values
    if (usdValue) {
        updateInputs(usdInput, parseFormattedNumber(usdValue));
    } else if (brlValue) {
        updateInputs(brlInput, parseFormattedNumber(brlValue));
    } else if (clpValue) {
        updateInputs(clpInput, parseFormattedNumber(clpValue));
    } else if (btcValue) {
        updateInputs(btcInput, parseFormattedNumber(btcValue));
    } else if (ethValue) {
        updateInputs(ethInput, parseFormattedNumber(ethValue));
    }
}

// Call the function on page load
window.onload = populateInputsFromURL;

// Add event listener to copy the website URL
document.getElementById('website-url').addEventListener('click', () => {
    const url = document.getElementById('website-url').innerText;
    navigator.clipboard.writeText(url).then(() => {
        alert('Website URL copied to clipboard: ' + url);
    });
}); 