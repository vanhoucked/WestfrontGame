const allImages = [
    "191408.jpg", "191409.jpg", "191609.jpg", "191612.jpg", "191704.jpg", "191705.jpg", "191706.jpg", "191811.jpg", "191907.jpg", "192002.jpg",
    "192011.jpg", "192012.jpg", "192812.jpg"
];
let images = [];
let timelineArray = [];

let maxScore = 0;
const endDelay = 30000; // 30 seconden
const gameDelay = 120000; // 2 minuten

const dragBox = document.getElementById('dragBox');
const grootScherm = document.getElementById('grootScherm');
const timeline = document.getElementById('timeline');

let translations = {};
let currentLanguage = "nl";

async function loadTranslations() {
    const response = await fetch("translations.json");
    translations = await response.json();
}

function t(key, placeholders = {}) {
    let text = translations[currentLanguage][key] || key;

    for (const [placeholder, value] of Object.entries(placeholders)) {
        text = text.replace(`{${placeholder}}`, value);
    }

    return text;
}

// Feedbackbollen in de onderste section
const feedbackContainer = document.createElement('div');
feedbackContainer.classList.add('feedback-container');
document.getElementById('touchscreenScherm').appendChild(feedbackContainer);

// Maak de feedbackbollen
const feedbackDots = [];
for (let i = 0; i < 9; i++) {
    const star = document.createElement('div'); // of 'span', afhankelijk van je gebruik
    star.classList.add('feedback-star');
    star.innerHTML = '★'; // Unicode ster (kan ook vervangen worden door een icoon van een bibliotheek zoals FontAwesome)
    feedbackContainer.appendChild(star);
    feedbackDots.push(star);
}

// Functie om 10 random afbeeldingen te selecteren
function getRandomImages(count) {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Load initial image in dragBox
let currentImageIndex = 0;
let hasTried = false;
const maxAttempts = 3;
let attemptCount = 0;

function loadImage() {
    if (currentImageIndex < images.length) {
        grootScherm.innerHTML = `<img src='img/${images[currentImageIndex]}' class='groot-scherm-img'>`;
        dragBox.innerHTML = `<img src='img/${images[currentImageIndex]}' draggable='true' id='currentImage' class='drag-box-img'>`;

        const img = document.getElementById('currentImage');
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', images[currentImageIndex]);
        });
    } else {
        endGame();
    }
}

function parseDate(imageName) {
    const year = parseInt(imageName.slice(0, 4));
    const month = parseInt(imageName.slice(4, 6));
    return new Date(year, month - 1);
}

// Handle drop logic
timeline.addEventListener('dragover', (e) => {
    e.preventDefault();
});

timeline.addEventListener('drop', (e) => {
    e.preventDefault();

    const newImage = e.dataTransfer.getData('text');
    const newDate = parseDate(newImage);

    const dropPosition = [...timeline.children].findIndex(el => el.getBoundingClientRect().left > e.clientX);

    let isValid = true;
    if (dropPosition === 0 && timelineArray.length > 0) {
        isValid = newDate < parseDate(timelineArray[0]);
    } else if (dropPosition === -1 && timelineArray.length > 0) {
        isValid = newDate > parseDate(timelineArray[timelineArray.length - 1]);
    } else if (dropPosition > 0) {
        const leftDate = parseDate(timelineArray[dropPosition - 1]);
        const rightDate = parseDate(timelineArray[dropPosition]);
        isValid = newDate > leftDate && newDate < rightDate;
    }

    if (isValid) {
        const imgElement = document.createElement('img');
        imgElement.src = `img/${newImage}`;
        imgElement.classList.add('timeline-img');
        timeline.insertBefore(imgElement, timeline.children[dropPosition] || null);
        timelineArray.splice(dropPosition, 0, newImage);

        if (currentImageIndex > 0) {
            feedbackDots[currentImageIndex - 1].style.color = "green";
        }

        currentImageIndex++;
        attemptCount = 0;
        hasTried = false;
        loadImage();
    } else {
        attemptCount++;
        hasTried = true;
        if (attemptCount >= maxAttempts) {
            const correctPosition = findCorrectPosition(newDate);
            const imgElement = document.createElement('img');
            imgElement.src = `img/${newImage}`;
            imgElement.classList.add('timeline-img');
            timeline.insertBefore(imgElement, timeline.children[correctPosition] || null);
            timelineArray.splice(correctPosition, 0, newImage);

            feedbackDots[currentImageIndex - 1].style.color = "red";

            showPopup(t("autoPlacement"));
            currentImageIndex++;
            attemptCount = 0;
            hasTried = false;
            loadImage();
        } else {
            //showPopup(); eventueel om error te geven bij eerste fout
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

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupText = document.createElement('p');
    popupText.innerHTML = message;
    popup.appendChild(popupText);

    const popupButton = document.getElementById('hidePopup');
    popupButton.innerText = t("buttonText");

    popup.style.display = 'block';
}

function hidePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';

    const popupText = document.getElementsByTagName("p");
    popupText.remove();
}

function startGame(language) {
    currentLanguage = language;
    document.getElementById('startScherm').style.display = 'none';
    document.getElementById('gameScherm').style.display = 'block';
    resetGame();

    setTimeout(() => {
        endGame();
    }, gameDelay);
}

function resetGame() {
    images = getRandomImages(10);
    timelineArray = [];
    currentImageIndex = 0;
    attemptCount = 0;
    hasTried = false;

    feedbackDots.forEach(dot => {
        dot.style.backgroundColor = "#ccc";
    });

    timeline.innerHTML = "";
    loadImage();
}

function resetToStart() {
    document.getElementById('startScherm').style.display = 'block';
    document.getElementById('gameScherm').style.display = 'none';
}

function endGame() {
    const score = feedbackDots.filter(dot => dot.style.backgroundColor === "green").length;
    maxScore = Math.max(maxScore, score);

    const scoreText = score === 1 ? point : points;
    grootScherm.innerHTML = `
    <h1>${t("gameOver")}</h1>
    <p>${t("yourScore")} ${score} ${t(scoreText)}</p>
    <p>${t("maxScore")} ${maxScore} ${t("points")}</p>`;
    dragBox.innerHTML = "";

    setTimeout(() => {
        document.getElementById('gameScherm').style.display = 'none';
        document.getElementById('startScherm').style.display = 'block';
    }, endDelay);
}

window.onload = async () => {
    await loadTranslations();
    document.getElementById('startScherm').style.display = 'block';
    document.getElementById('gameScherm').style.display = 'none';
};
