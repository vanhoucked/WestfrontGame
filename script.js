
// Simuleer afbeeldingen uit de map
const allImages = [
    "191408.jpg", "191409.jpg", "191609.jpg", "191612.jpg", "191704.jpg", "191705.jpg", "191706.jpg", "191811.jpg", "191907.jpg", "192002.jpg",
    "192011.jpg", "192012.jpg", "192812.jpg"
];
const images = getRandomImages(10);
const timelineArray = [];

const dragBox = document.getElementById('dragBox');
const grootScherm = document.getElementById('grootScherm');
const timeline = document.getElementById('timeline');

// Functie om 10 random afbeeldingen te selecteren
function getRandomImages(count) {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Load initial image in dragBox
let currentImageIndex = 0;
function loadImage() {
    if (currentImageIndex < images.length) {
        // Voeg de afbeelding in groot formaat toe aan het grote scherm
        grootScherm.innerHTML = `<img src='/img/${images[currentImageIndex]}' style='width: 500px; height: auto;'>`;

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
loadImage();

// Handle drop logic
timeline.addEventListener('dragover', (e) => {
    e.preventDefault();
    const hoveredElement = e.target;
    if (hoveredElement.tagName === 'IMG') {
        hoveredElement.style.marginRight = "30px";
        hoveredElement.style.marginLeft = "30px";
    }
});

timeline.addEventListener('dragleave', (e) => {
    const hoveredElement = e.target;
    if (hoveredElement.tagName === 'IMG') {
        hoveredElement.style.marginRight = "10px";
        hoveredElement.style.marginLeft = "10px";
    }
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
        imgElement.style.margin = "10px";
        timeline.insertBefore(imgElement, timeline.children[dropPosition] || null);
        timelineArray.splice(dropPosition, 0, newImage);

        // Load next image
        currentImageIndex++;
        loadImage();
    } else {
        alert('Ongeldige plaatsing!');
    }
});

function parseDate(imageName) {
    const year = parseInt(imageName.slice(0, 4));
    const month = parseInt(imageName.slice(4, 6));
    return new Date(year, month - 1);
}