// Set destination1 to Nagpur
const destination1 = "Nagpur";

const oneWayRates = {
    'Swift Dzire': { rate: 22, image: 'https://tanushreecabs.com/wp-content/uploads/2024/11/dzire-tour-s.webp' },
    'Maruti Ertiga': { rate: 28, image: 'https://tanushreecabs.com/wp-content/uploads/2024/11/maruti-ertiga-taxi-nagpur.webp' },
    'Kia Carens': { rate: 30, image: 'https://tanushreecabs.com/wp-content/uploads/2024/11/kia-carens-taxi-nagpur.webp' },
    'Innova Crysta': { rate: 34, image: 'https://tanushreecabs.com/wp-content/uploads/2024/11/toyota-innova-taxi.webp' },
    'Maruti Ciaz': { rate: 38, image: 'http://amzcabs.in/wp-content/uploads/2024/11/maruti-suzuki-ciaz.webp' },
};

document.addEventListener('DOMContentLoaded', function () {
    const searchBoxContainer = document.getElementById('searchBoxContainer');

    document.getElementById('destination2').addEventListener('focus', function () {
        searchBoxContainer.style.paddingBottom = '200px';
    });

    document.getElementById('destination2').addEventListener('blur', function () {
        searchBoxContainer.style.paddingBottom = '0';
    });

    // Load Bing Maps script
    const script = document.createElement('script');
    script.src = 'https://www.bing.com/api/maps/mapcontrol?key=add bing map api key here&callback=loadMapScenario';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
});

function loadMapScenario() {
    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: onLoad,
        errorCallback: onError
    });

    function onLoad() {
        const options = { maxResults: 5 };
        const manager = new Microsoft.Maps.AutosuggestManager(options);
        manager.attachAutosuggest('#destination2', '#searchBoxContainer', selectedSuggestion);
    }

    function onError(message) {
        console.error(message);
    }

    function selectedSuggestion(suggestionResult) {
        document.getElementById('destination2').value = suggestionResult.formattedSuggestion;
    }
}

function calculateDistanceAndFare() {
    const destination2 = document.getElementById('destination2').value;

    if (!destination2) {
        alert('Please enter the drop destination.');
        return;
    }

    getRoute(destination1, destination2)
        .then(distance => {
            calculateFare(distance);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error occurred while fetching route information.');
        });
}

function getRoute(origin, destination) {
    const apiKey = 'add bing map api key here';
    const routesUrl = `https://dev.virtualearth.net/REST/v1/Routes/Driving?wp.0=${encodeURIComponent(origin)}&wp.1=${encodeURIComponent(destination)}&key=${apiKey}`;

    return fetch(routesUrl)
        .then(response => response.json())
        .then(data => {
            if (data?.resourceSets?.[0]?.resources?.[0]?.travelDistance) {
                return data.resourceSets[0].resources[0].travelDistance;
            } else {
                throw new Error('No route found for the destinations.');
            }
        });
}

function calculateFare(distance) {
    if (!isNaN(distance)) {
        const fareDistance = distance < 150 ? 150 : distance;
        let resultsHtml = '';

        for (const carModel in oneWayRates) {
            const fare = calculateOneWayFare(carModel, fareDistance);

            if (typeof fare === 'number') {
                const extraChargePerKm = oneWayRates[carModel].rate;
                const carImage = oneWayRates[carModel].image;
                const destination2 = document.getElementById('destination2').value;
                const whatsappMessage = encodeURIComponent(`Cab Booking Inquiry:
Vehicle: ${carModel}
From: ${destination1}
To: ${destination2}
Distance: ${fareDistance.toFixed(0)} km
Total Fare: ₹${fare.toFixed(0)}
Extra Charge: ₹${extraChargePerKm} per km`);

                resultsHtml += `
                    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); margin-bottom: 15px; display: flex; flex-direction: column; align-items: center;">
                        <img src="${carImage}" alt="${carModel}" style="width: 180px; height: 100px; object-fit: cover; margin-bottom: 20px;">
                        <div style="text-align: center;">
                            <h3 style="margin: 0; color: black;">${carModel}</h3>
                            <p style="font-size: 24px; margin: 10px 0; color: black;">₹${fare.toFixed(0)}</p>
                            <p style="margin: 0; color: black;">Included: ${fareDistance.toFixed(0)} kms</p>
                            <p style="margin: 0; color: black;">Extra: ₹${extraChargePerKm} per km</p>
                            <a href="https://wa.me/+917666840935?text=${whatsappMessage}" 
                               target="_blank" 
                               style="display: inline-block; background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                                Book via WhatsApp
                            </a>
                        </div>
                    </div>
                `;
            }
        }

        document.getElementById('result').innerHTML = resultsHtml;
    } else {
        document.getElementById('result').innerText = 'Please enter a valid distance.';
    }
}

function calculateOneWayFare(carModel, distance) {
    return oneWayRates[carModel] ? oneWayRates[carModel].rate * distance : 'Invalid car model';
}
