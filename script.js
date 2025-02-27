let puzzle;
let words = [];
let selected = [];
let solvedCategories = [];
let mistakes = 0;
let gameOver = false;

// Array mischen
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Wörter im Gitter anzeigen
function displayGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    words.forEach(word => {
        const div = document.createElement('div');
        div.className = 'word bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-indigo-50 transition';
        div.textContent = word;
        div.addEventListener('click', () => toggleSelect(div));
        grid.appendChild(div);
    });
}

// Wort auswählen/abwählen
function toggleSelect(div) {
    if (gameOver) return;
    if (div.classList.contains('selected')) {
        div.classList.remove('selected', 'bg-indigo-200');
        selected = selected.filter(w => w !== div.textContent);
    } else if (selected.length < 4) {
        div.classList.add('selected', 'bg-indigo-200');
        selected.push(div.textContent);
    }
    document.getElementById('submit').disabled = selected.length !== 4;
}

// Auswahl zurücksetzen
function clearSelection() {
    document.querySelectorAll('.word.selected').forEach(div => div.classList.remove('selected', 'bg-indigo-200'));
    selected = [];
    document.getElementById('submit').disabled = true;
}

// Gelöste Kategorie anzeigen
function displaySolvedCategory(category) {
    const solvedDiv = document.getElementById('solved-categories');
    const div = document.createElement('div');
    div.className = `p-3 mb-3 rounded-lg ${category.color === 'yellow' ? 'bg-yellow-100' : category.color === 'green' ? 'bg-green-100' : category.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'}`;
    div.textContent = `${category.name}: ${category.words.join(', ')}`;
    solvedDiv.appendChild(div);
}

// Nachricht anzeigen
function showMessage(msg) {
    document.getElementById('message').textContent = msg;
}

// Lösung bei Spielende anzeigen
function displaySolution() {
    puzzle.categories.forEach(category => {
        if (!solvedCategories.includes(category)) {
            displaySolvedCategory(category);
        }
    });
}

// Überprüfen-Button
document.getElementById('submit').addEventListener('click', () => {
    if (gameOver) return;
    const group = selected.sort().join(',');
    const category = puzzle.categories.find(cat => cat.words.sort().join(',') === group);
    if (category) {
        solvedCategories.push(category);
        words = words.filter(w => !selected.includes(w));
        displaySolvedCategory(category);
        if (solvedCategories.length === 4) {
            gameOver = true;
            showMessage('Glückwunsch! Alle Kategorien gefunden.');
        }
    } else {
        mistakes++;
        document.getElementById('mistakes').textContent = mistakes;
        if (mistakes >= 4) {
            gameOver = true;
            showMessage('Spiel vorbei. Zu viele Fehler.');
            displaySolution();
        } else {
            showMessage('Falsch, nochmal versuchen.');
        }
    }
    clearSelection();
});

// Mischen-Button
document.getElementById('shuffle').addEventListener('click', () => {
    if (gameOver) return;
    words = shuffle(words);
    displayGrid();
    clearSelection();
});

// Cookie-Zustimmung
if (!getCookie('consent')) {
    document.getElementById('cookie-popup').style.display = 'block';
}

document.getElementById('accept-cookies').addEventListener('click', () => {
    setCookie('consent', 'accepted', 365);
    document.getElementById('cookie-popup').style.display = 'none';
    loadAd();
});

document.getElementById('decline-cookies').addEventListener('click', () => {
    setCookie('consent', 'declined', 365);
    document.getElementById('cookie-popup').style.display = 'none';
    document.getElementById('ad-card').textContent = 'Werbung (nur mit Cookie-Zustimmung sichtbar)';
});

// Puzzle laden
fetch('words.json')
    .then(response => response.json())
    .then(data => {
        puzzle = data[Math.floor(Math.random() * data.length)];
        words = shuffle(puzzle.categories.flatMap(cat => cat.words));
        displayGrid();
    })
    .catch(error => console.error('Fehler beim Laden der Wörter:', error));

// Werbung laden
function loadAd() {
    fetch('ads.json')
        .then(response => response.json())
        .then(ads => {
            const ad = ads[Math.floor(Math.random() * ads.length)];
            const adCard = document.getElementById('ad-card');
            if (getCookie('consent') === 'accepted') {
                adCard.classList.add('cursor-pointer');
                adCard.addEventListener('click', () => {
                    window.open(ad.link, '_blank');
                });
                if (ad.type === 'html') {
                    adCard.innerHTML = ad.content;
                } else {
                    adCard.textContent = ad.content;
                }
            } else {
                adCard.textContent = 'Werbung (nur mit Cookie-Zustimmung sichtbar)';
                adCard.classList.remove('cursor-pointer');
                adCard.removeEventListener('click', () => {});
            }
        })
        .catch(error => console.error('Fehler beim Laden der Werbung:', error));
}

// Cookie-Helfer
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Initiale Werbung laden, falls akzeptiert
if (getCookie('consent') === 'accepted') {
    loadAd();
}