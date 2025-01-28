const allImages = [
    "189112.jpg",
    "191312.jpg",
    "191406.jpg",
    "191407.jpg",
    "191408.jpg",
    "191409.jpg",
    "191410.jpg",
    "191412.jpg",
    "191501.jpg",
    "191502.jpg",
    "191504.jpg",
    "191505.JPG",
    "191506.jpg",
    "191509.jpg",
    "191605.JPG",
    "191609.jpg",
    "191612.jpg",
    "191704.jpg",
    "191705.jpg",
    "191706.jpg",
    "191707.jpg",
    "191708.jpg",
    "191712.jpg",
    "191801.jpg",
    "191808.jpg",
    "191811.jpg",
    "191812.jpg",
    "191907.jpg",
    "192002.jpg",
    "192004.jpg",
    "192005.jpg",
    "192011.jpg",
    "192012.jpg",
    "192102.jpg",
    "192312.jpg",
    "192412.jpg",
    "192812.jpg",
    "194112.jpg"
  ];
let images = [];
let timelineArray = [];

let score = 0;
let maxScore = 0;
const endDelay = 30000; // 30 seconden
let gameDelay = 120000; // 2 minuten
let gameTimer; // Variable to store the timer ID

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
    const dot = document.createElement('div');
    dot.classList.add('feedback-dot');
    feedbackContainer.appendChild(dot);
    feedbackDots.push(dot);
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
        grootScherm.innerHTML = `<img src='img/${images[currentImageIndex]}' class='groot-scherm-img fade-in'>`;
        dragBox.innerHTML = `<img src='img/${images[currentImageIndex]}' draggable='true' id='currentImage' class='drag-box-img fade-in'>`;

        const img = document.getElementById('currentImage');
        img.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', images[currentImageIndex]);
        });

        updateExplanation(currentImageIndex + 1);
    } else {
        endGame();
    }
}

function updateExplanation(pictureNumber) {
    const explanationDiv = document.getElementById('explanation');
    if (pictureNumber === 1) {
        explanationDiv.innerHTML = `
            <p>${t("firstPicture")}</p>
        `;
    } else {
        explanationDiv.innerHTML = `
            <p>${t("otherPictures")}</p>
        `;
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
    actionDetected();

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
            feedbackDots[currentImageIndex - 1].style.backgroundColor = "#96aa9f";
            score++;
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

            //feedbackDots[currentImageIndex - 1].style.backgroundColor = "red";

            showPopup("autoPlacement");
            currentImageIndex++;
            attemptCount = 0;
            hasTried = false;
            loadImage();
        } else {
            showPopup("invalidPlacement");
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
    pogingenOver = maxAttempts - attemptCount;

    const popupDiv = document.getElementById("popup");

    if (message == "invalidPlacement") {
        if (pogingenOver == 1) {
            popupDiv.innerHTML = `<p>${t(message)} ${pogingenOver} ${t("try")} </p>`;
        } if (pogingenOver > 1) {
            popupDiv.innerHTML = `<p>${t(message)} ${pogingenOver} ${t("tries")} </p>`;
        }
    } else {
        popupDiv.innerHTML = `<p>${t(message)}</p>`;
    }

    
}

function hidePopup() {
    const popupTextOld = document.getElementById("popup");
    popupTextOld.innerHTML = "";
}

function preloadImages(imagePaths) {
    const preloadPromises = imagePaths.map((imagePath) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `img/${imagePath}`;
            img.onload = resolve; // Resolve when the image is fully loaded
            img.onerror = reject; // Reject if there’s an error loading the image
        });
    });
    return Promise.all(preloadPromises);
}

async function startGame(language) {
    currentLanguage = language;
    document.getElementById('startScherm').style.display = 'none';
    document.getElementById('gameScherm').style.display = 'block';

    var touchScreenTopDiv = document.getElementsByClassName("touchScreenTop");
    for (var i = 0; i < touchScreenTopDiv.length; i++){
        touchScreenTopDiv[i].style.display = "flex";
    }

    resetGame();

    try {
        // Preload images
        await preloadImages(images);
        console.log("All images preloaded successfully.");
    } catch (error) {
        console.error("Error preloading images:", error);
    }
}

function startGameTimer() {
    // Clear any existing timer to prevent overlapping
    clearTimeout(gameTimer);

    // Start a new timer
    gameTimer = setTimeout(() => {
        endGame();
    }, gameDelay);
}

function resetGame() {
    images = getRandomImages(10);
    timelineArray = [];
    currentImageIndex = 0;
    attemptCount = 0;
    score = 0;
    hasTried = false;

    hidePopup()

    feedbackDots.forEach(dot => {
        dot.style.backgroundColor = "#bfc6be";
    });

    timeline.innerHTML = "";
    loadImage();
}

function resetToStart() {
    document.getElementById('startScherm').style.display = 'block';
    document.getElementById('gameScherm').style.display = 'none';
}

function actionDetected() {
    gameDelay = 120000;
    startGameTimer();
    hidePopup();
}

function endGame() {
    maxScore = Math.max(maxScore, score);

    const scoreText = score === 1 ? "point" : "points";
    
    var touchScreenTopDiv = document.getElementsByClassName("touchScreenTop");
    for (var i = 0; i < touchScreenTopDiv.length; i++){
        touchScreenTopDiv[i].style.display = "none";
    }
    
    const dragBoxDiv = document.getElementById("dragBox");
    dragBoxDiv.innerHTML = `<div id="scoreBox">
    <h1>${t("gameOver")}</h1>
    <p>${t("yourScore")} ${score} ${t(scoreText)}</p>
    <p>${t("maxScore")} ${maxScore} ${t("points")}</p></div>`;
    dragBoxDiv.style.display = "flex";

    const bovenSection = document.getElementById("grootScherm");
    bovenSection.innerHTML = `<img src="img/WestfrontLogo.png">`;

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
