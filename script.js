
// Simuleer afbeeldingen uit de map
const allImages = [
    "191408.jpg", "191409.jpg", "191609.jpg", "191612.jpg", "191704.jpg", "191705.jpg", "191706.jpg", "191811.jpg", "191907.jpg", "192002.jpg",
    "192011.jpg", "192012.jpg", "192812.jpg"
];

let images = [];
let timelineArray = [];

const dragBox = document.getElementById('dragBox');
const grootScherm = document.getElementById('grootScherm');
const timeline = document.getElementById('timeline');

// Feedbackbollen in de onderste section
const feedbackContainer = document.createElement('div');
feedbackContainer.style.position = "absolute";
feedbackContainer.style.bottom = "10px";
feedbackContainer.style.right = "10px";
feedbackContainer.style.display = "flex";
feedbackContainer.style.gap = "5px";
document.getElementById('touchscreenScherm').appendChild(feedbackContainer);

// Maak de feedbackbollen
const feedbackDots = [];
for (let i = 0; i < 9; i++) {
    const dot = document.createElement('div');
    dot.style.width = "20px";
    dot.style.height = "20px";
    dot.style.borderRadius = "50%";
    dot.style.backgroundColor = "#ccc";
    feedbackContainer.appendChild(dot);
    feedbackDots.push(dot);
}

// Functie om 10 random afbeeldingen te selecteren
function getRandomImages(count) {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Reset alle logica
function resetGame() {
    images = getRandomImages(10);
    timelineArray = [];
    currentImageIndex = 0;
    attemptCount = 0;
    hasTried = false;

    // Verwijder bestaande feedbackbollen
    feedbackDots.forEach(dot => {
        dot.style.backgroundColor = "#ccc";
    });

    // Leeg de tijdlijn
    timeline.innerHTML = "";

    // Laad de eerste afbeelding
    loadImage();
}

// Load initial image in dragBox
let currentImageIndex = 0;
let hasTried = false;
const maxAttempts = 2;
let attemptCount = 0;

function loadImage() {
    if (currentImageIndex < images.length) {
        // Voeg de afbeelding in groot formaat toe aan het grote scherm
        grootScherm.innerHTML = `<img src='/img/${images[currentImageIndex]}' style='width: auto; height: 80%;'>`;

        // Voeg de afbeelding toe aan de dragBox
        dragBox.innerHTML = `<img src='/img/${images[currentImageIndex]}' draggable='true' id='currentImage'>`;
        const img = document.getElementById('currentImage');

        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', images[currentImageIndex]);
        });
    } else {
        dragBox.innerHTML = "<p>Alle afbeeldingen staan op de tijdlijn!</p>";
    }
}

// Handle drop logic
timeline.addEventListener('dragover', (e) => {
    e.preventDefault();
});

timeline.addEventListener('drop', (e) => {
    e.preventDefault();

    const newImage = e.dataTransfer.getData('text');
    const newDate = parseDate(newImage);

    // Determine drop position
    const dropPosition = [...timeline.children].findIndex(el => el.getBoundingClientRect().left > e.clientX);

    // Validation logic
    let isValid = true;
    if (dropPosition === 0 && timelineArray.length > 0) {
        // Check leftmost placement
        isValid = newDate < parseDate(timelineArray[0]);
    } else if (dropPosition === -1 && timelineArray.length > 0) {
        // Check rightmost placement
        isValid = newDate > parseDate(timelineArray[timelineArray.length - 1]);
    } else if (dropPosition > 0) {
        // Check between two elements
        const leftDate = parseDate(timelineArray[dropPosition - 1]);
        const rightDate = parseDate(timelineArray[dropPosition]);
        isValid = newDate > leftDate && newDate < rightDate;
    }

    if (isValid) {
        // Update timeline
        const imgElement = document.createElement('img');
        imgElement.src = `/img/${newImage}`;
        imgElement.style.margin = "30px";
        timeline.insertBefore(imgElement, timeline.children[dropPosition] || null);
        timelineArray.splice(dropPosition, 0, newImage);

        // Update feedback
        if (currentImageIndex > 0 && !hasTried) {
            feedbackDots[currentImageIndex - 1].style.backgroundColor = "green";
        }

        // Reset attempt count and load next image
        currentImageIndex++;
        attemptCount = 0;
        hasTried = false;
        loadImage();
    } else {
        attemptCount++;
        if (currentImageIndex > 0 && !hasTried) {
            feedbackDots[currentImageIndex - 1].style.backgroundColor = "red";
        }
        hasTried = true;
        if (attemptCount >= maxAttempts) {
            // Automatically place the image correctly
            const correctPosition = findCorrectPosition(newDate);
            const imgElement = document.createElement('img');
            imgElement.src = `/img/${newImage}`;
            imgElement.style.margin = "30px";
            timeline.insertBefore(imgElement, timeline.children[correctPosition] || null);
            timelineArray.splice(correctPosition, 0, newImage);

            alert('De afbeelding is automatisch op de juiste plaats gezet.');

            // Reset attempt count and load next image
            currentImageIndex++;
            attemptCount = 0;
            hasTried = false;
            loadImage();
        } else {
            alert('Ongeldige plaatsing! Probeer opnieuw.');
        }
    }
});

function findCorrectPosition(newDate) {
    if (timelineArray.length === 0) return 0;
    for (let i = 0; i < timelineArray.length; i++) {
        if (newDate < parseDate(timelineArray[i])) {
            return i;
        }
    }
    return timelineArray.length;
}

function parseDate(imageName) {
    const year = parseInt(imageName.slice(0, 4));
    const month = parseInt(imageName.slice(4, 6));
    return new Date(year, month - 1);
}

// Start het spel met reset
function startGame(language) {
    console.log(`Geselecteerde taal: ${language}`);
    document.getElementById('startScherm').style.display = 'none';
    document.getElementById('gameScherm').style.display = 'block';
    resetGame();
}