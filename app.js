let lives = 3;
const tourLocation = { latitude: -27.6220, longitude: -48.6770 }; // Coordinates for Pedra Branca Experience
const locationRange = 600; // Define the acceptable range (in meters) for matching location
let map, userMarker, tourCircle;

function nextStep(step) {
    console.log('Navigating to:', step);
    showStep(step);
    if (step === 'step-4') {
        initMap();
    }
}

function showStep(step) {
    const steps = document.querySelectorAll('.container > div');
    steps.forEach(s => s.classList.add('hidden'));
    document.getElementById(step).classList.remove('hidden');
    console.log('Showing step:', step);
}

function startTour() {
    const selectedTour = document.getElementById('tour-select').value;
    console.log('Selected Tour:', selectedTour);
    
    if (selectedTour === 'pedra-branca') {
        nextStep('step-4');
    } else {
        alert('Please select a valid tour.');
    }
}

function initMap() {
    map = L.map('map').setView([tourLocation.latitude, tourLocation.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    tourCircle = L.circle([tourLocation.latitude, tourLocation.longitude], {
        color: 'blue',
        fillColor: '#add8e6',
        fillOpacity: 0.5,
        radius: locationRange // Radius in meters
    }).addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updateUserLocation, showError, { enableHighAccuracy: true });
    } else {
        showLocationMessage('Geolocation is not supported by this browser.', 'incorrect');
    }
}

function updateUserLocation(position) {
    const userLatitude = position.coords.latitude;
    const userLongitude = position.coords.longitude;

    if (userMarker) {
        userMarker.setLatLng([userLatitude, userLongitude]);
    } else {
        userMarker = L.marker([userLatitude, userLongitude]).addTo(map);
    }

    const distance = getDistanceFromLatLonInKm(userLatitude, userLongitude, tourLocation.latitude, tourLocation.longitude) * 1000;
    console.log(`User location: ${userLatitude}, ${userLongitude}`);
    console.log(`Tour location: ${tourLocation.latitude}, ${tourLocation.longitude}`);
    console.log(`Distance: ${distance} meters`);

    if (distance <= locationRange) {
        document.getElementById('start-tour-button').classList.remove('disabled');
    } else {
        document.getElementById('start-tour-button').classList.add('disabled');
    }
}

function showLocationMessage(message, type) {
    const locationMessage = document.getElementById('location-message');
    locationMessage.textContent = message;
    locationMessage.className = `feedback ${type}`;
    locationMessage.style.display = 'block';
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            showLocationMessage('User denied the request for Geolocation.', 'incorrect');
            break;
        case error.POSITION_UNAVAILABLE:
            showLocationMessage('Location information is unavailable.', 'incorrect');
            break;
        case error.TIMEOUT:
            showLocationMessage('The request to get user location timed out.', 'incorrect');
            break;
        case error.UNKNOWN_ERROR:
            showLocationMessage('An unknown error occurred.', 'incorrect');
            break;
    }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function startMystery() {
    lives = 3; // Reset lives at the start of the mystery
    updateLives();
    nextStep('step-5');
}

function checkAnswer(mystery, correctAnswer) {
    const userAnswer = document.getElementById(`answer-${mystery}`).value.trim().toLowerCase();
    const feedbackElement = document.getElementById(`feedback-${mystery}`);
    console.log(`Checking answer for mystery ${mystery}:`, userAnswer);

    if (userAnswer === correctAnswer.toLowerCase()) {
        console.log('Correct answer!');
        feedbackElement.textContent = 'Correct! Moving to the next mystery...';
        feedbackElement.className = 'feedback correct';
        feedbackElement.style.display = 'block';
        setTimeout(() => {
            feedbackElement.style.display = 'none';
            nextStep(`step-${mystery + 6}`);
        }, 2000); // Show feedback for 2 seconds before moving to the next step
    } else {
        console.log('Incorrect answer.');
        feedbackElement.textContent = 'Incorrect. Try again.';
        feedbackElement.className = 'feedback incorrect';
        feedbackElement.style.display = 'block';
        lives--;
        updateLives();
        if (lives > 0) {
            setTimeout(() => {
                feedbackElement.style.display = 'none';
            }, 2000); // Hide feedback after 2 seconds
        } else {
            nextStep('step-gameover');
        }
    }
}

function updateLives() {
    const heartsContainers = document.querySelectorAll('.hearts');
    heartsContainers.forEach(hearts => {
        hearts.innerHTML = '';
        for (let i = 0; i < lives; i++) {
            hearts.innerHTML += '<span class="heart">❤️</span>';
        }
    });
}
