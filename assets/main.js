// assets/main.js

const DEFAULT_LANG = 'en';

// --- Utility Functions (Toast, localStorage) ---

/**
 * टोस्ट अलर्ट दिखाने का फंक्शन
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toastHTML = `
        <div class="toast text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * लोकल स्टोरेज से सेव्ड स्टोरी IDs को मैनेज करता है।
 */
function getSavedStories() {
    const saved = localStorage.getItem('savedStories');
    return saved ? JSON.parse(saved) : [];
}

/**
 * स्टोरी को सेव/अनसेव करता है और टोस्ट दिखाता है।
 */
function toggleSaveStory(storyId) {
    let savedStories = getSavedStories();
    const isSaved = savedStories.includes(storyId);

    if (isSaved) {
        savedStories = savedStories.filter(id => id !== storyId);
        showToast(`'${storyId}' Unsaved!`, 'danger');
    } else {
        savedStories.push(storyId);
        showToast(`'${storyId}' Saved!`, 'success');
    }

    localStorage.setItem('savedStories', JSON.stringify(savedStories));
    return !isSaved;
}

/**
 * दी गई स्टोरी ID के लिए JSON डेटा फ़ेच करता है।
 */
async function fetchStoryData(storyId) {
    try {
        // पाथ को रूट-रिलेटिव (`/`) या डायरेक्ट्री के अनुसार सेट करें
        // GitHub Pages के लिए, इसे `content/${storyId}/data.json` से बदलने का प्रयास करें
        // या अगर आप लोकल पर चला रहे हैं तो `../content/${storyId}/data.json` का उपयोग करें
        
        // हम एक सरल रिलेटिव पाथ का उपयोग कर रहे हैं।
        // index.html के लिए: content/storyX/data.json
        // story.html के लिए: ../../content/storyX/data.json (जो काम नहीं करेगा)
        
        // एक सुरक्षित तरीका: URL से बेस पाथ निकालें और पाथ जोड़ें
        let basePath = window.location.pathname.includes('content') ? '../../' : ''; 
        
        // GitHub Pages के लिए अक्सर रूट-रिलेटिव पाथ `/repo-name/path/` की आवश्यकता होती है।
        // लोकल टेस्टिंग के लिए, इसे सरल रखते हैं:
        const pathPrefix = window.location.pathname.endsWith('story.html') ? '../../' : '';
        const response = await fetch(`${pathPrefix}content/${storyId}/data.json`);

        if (!response.ok) {
            // अगर लोकल टेस्टिंग में 404 आता है, तो पाथ को एडजस्ट करें
            console.error(`Attempted path: ${pathPrefix}content/${storyId}/data.json`);
            throw new Error(`Failed to fetch ${storyId} data`);
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching story data:", error);
        return null;
    }
}

// --- Page Loading Functions ---

/**
 * होम पेज पर केवल स्टोरी लिंक्स को लोड करता है। (सरल किया गया)
 */
async function loadHomeLinks(storyIds) {
    const container = document.getElementById('stories-container');
    if (!container) return;

    for (const storyId of storyIds) {
        // हम index.html पर डेटा फ़ेच नहीं कर रहे हैं, इसलिए यह तेज होगा।
        // केवल डमी टाइटल और लिंक दिखाएँ।
        const linkHtml = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card story-card text-center p-3">
                    <h5 class="card-title text-primary">${storyId.toUpperCase()} - Finance Story</h5>
                    <p class="card-text text-muted">Click to Read the full content and manage actions.</p>
                    <a href="content/${storyId}/story.html?id=${storyId}" class="btn btn-sm btn-dark mt-2">
                        <i class="bi bi-book me-2"></i> Read Story
                    </a>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', linkHtml);
    }
}


/**
 * स्टोरी पेज पर कंटेंट लोड करता है और बटन इवेंट्स सेट करता है। (वही फंक्शनैलिटी)
 */
async function loadStoryPage(storyId) {
    const data = await fetchStoryData(storyId);
    if (!data) return;

    let currentLang = localStorage.getItem('storyLang') || DEFAULT_LANG;

    const titleElement = document.getElementById('story-title');
    const contentElement = document.getElementById('story-content');
    const saveBtn = document.getElementById('save-btn');
    const langBtn = document.getElementById('lang-btn');
    const heroImg = document.getElementById('story-hero-img');

    if (heroImg) heroImg.src = data.image.replace(/\.\.\/\.\.\//g, '../../'); // पाथ को ठीक करें

    // Save Button Setup
    const updateSaveButton = () => {
        const isSaved = getSavedStories().includes(storyId);
        if (saveBtn) {
            saveBtn.innerHTML = isSaved ?
                '<i class="bi bi-bookmark-fill me-2"></i> Unsave' :
                '<i class="bi bi-bookmark me-2"></i> Save';
            saveBtn.classList.toggle('btn-success', !isSaved);
            saveBtn.classList.toggle('btn-danger', isSaved);
        }
    };

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            toggleSaveStory(storyId);
            updateSaveButton();
        });
        updateSaveButton();
    }

    // Language Switcher Function
    const renderContent = (lang) => {
        const availableLangs = ['en', 'hi', 'bn'].filter(l => data.content[l]);
        const effectiveLang = availableLangs.includes(lang) ? lang : availableLangs[0] || DEFAULT_LANG;

        if (titleElement) titleElement.textContent = data.title[effectiveLang] || data.title[DEFAULT_LANG] || 'Story Title';
        if (contentElement) {
            contentElement.innerHTML = data.content[effectiveLang].map(p => `<p>${p}</p>`).join('');
        }
        if (langBtn) langBtn.textContent = `Lang: ${effectiveLang.toUpperCase()}`;

        localStorage.setItem('storyLang', effectiveLang);
    };

    // Language Button Setup
    if (langBtn) {
        const availableLangs = ['en', 'hi', 'bn'].filter(lang => data.content[lang]);
        let langIndex = availableLangs.indexOf(currentLang);
        if (langIndex === -1) langIndex = 0;

        langBtn.addEventListener('click', () => {
            langIndex = (langIndex + 1) % availableLangs.length;
            currentLang = availableLangs[langIndex];
            renderContent(currentLang);
            showToast(`Language changed to ${currentLang.toUpperCase()}`, 'info');
        });
    }

    // Initial content render
    renderContent(currentLang);
}

/**
 * सेव्ड पेज पर स्टोरीज़ लोड करता है।
 */
async function loadSavedPage() {
    const container = document.getElementById('saved-stories-container');
    if (!container) return;

    const savedStories = getSavedStories();
    const currentLang = localStorage.getItem('storyLang') || DEFAULT_LANG;

    if (savedStories.length === 0) {
        container.innerHTML = '<p class="text-center mt-5 lead">No stories saved yet. Go to the <a href="index.html">Home page</a> to save one.</p>';
        return;
    }

    for (const storyId of savedStories) {
        const data = await fetchStoryData(storyId);
        if (data) {
            const cardHtml = `
                <div class="col-md-12 mb-4" id="saved-card-${storyId}">
                    <div class="card story-card d-flex flex-row align-items-center p-2">
                        <img src="${data.image.replace(/\.\.\/\.\.\//g, 'assets/')}" class="rounded-start" style="width: 100px; height: 100px; object-fit: cover;" alt="${data.title[currentLang] || data.title[DEFAULT_LANG]}">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title mb-1">${data.title[currentLang] || data.title[DEFAULT_LANG]}</h5>
                                <p class="card-text"><small class="text-muted">${data.category}</small></p>
                            </div>
                            <div>
                                <a href="content/${storyId}/story.html?id=${storyId}" class="btn btn-sm btn-primary me-2"><i class="bi bi-eye"></i> Read</a>
                                <button class="btn btn-sm btn-danger unsave-btn" data-story-id="${storyId}">
                                    <i class="bi bi-bookmark-x"></i> Unsave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        }
    }

    // Attach unsave event listeners
    document.querySelectorAll('.unsave-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const storyId = e.currentTarget.getAttribute('data-story-id');
            const newStatus = toggleSaveStory(storyId);

            if (!newStatus) {
                document.getElementById(`saved-card-${storyId}`).remove();
                if (getSavedStories().length === 0) {
                    loadSavedPage();
                }
            }
        });
    });
}


// Event listeners based on the current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/') {
        const storyIds = ['story1', 'story2']; 
        loadHomeLinks(storyIds); // Changed to loadHomeLinks
    } else if (path.endsWith('saved.html')) {
        loadSavedPage();
    } else if (path.endsWith('story.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const storyId = urlParams.get('id');
        if (storyId) {
            loadStoryPage(storyId);
        }
    }
});

