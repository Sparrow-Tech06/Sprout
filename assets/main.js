// assets/main.js

const DEFAULT_LANG = 'en';

/**
 * टोस्ट अलर्ट दिखाने का फंक्शन
 * @param {string} message - टोस्ट में दिखाने वाला मैसेज
 * @param {string} type - टोस्ट का टाइप ('success', 'danger', 'info')
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    // बूटस्ट्रैप टोस्ट HTML
    const toastHTML = `
        <div class="toast text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    // पुराने टोस्ट को साफ़ करें और नया जोड़ें
    // toastContainer.innerHTML = ''; // अगर एक ही टोस्ट दिखाना हो
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // टोस्ट के बंद होने के बाद उसे DOM से हटा दें
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}


/**
 * लोकल स्टोरेज से सेव्ड स्टोरी IDs को मैनेज करता है।
 * @returns {Array<string>} सेव्ड स्टोरी IDs का ऐरे।
 */
function getSavedStories() {
    const saved = localStorage.getItem('savedStories');
    return saved ? JSON.parse(saved) : [];
}

/**
 * स्टोरी को सेव/अनसेव करता है और टोस्ट दिखाता है।
 * @param {string} storyId - स्टोरी की ID (e.g., 'story1')
 */
function toggleSaveStory(storyId) {
    let savedStories = getSavedStories();
    const isSaved = savedStories.includes(storyId);

    if (isSaved) {
        // Unsave
        savedStories = savedStories.filter(id => id !== storyId);
        showToast(`'${storyId}' Unsaved!`, 'danger');
    } else {
        // Save
        savedStories.push(storyId);
        showToast(`'${storyId}' Saved!`, 'success');
    }

    localStorage.setItem('savedStories', JSON.stringify(savedStories));
    return !isSaved; // Returns the new saved status
}

/**
 * दी गई स्टोरी ID के लिए JSON डेटा फ़ेच करता है।
 * @param {string} storyId - स्टोरी ID
 * @returns {Promise<Object>} स्टोरी डेटा
 */
async function fetchStoryData(storyId) {
    try {
        const response = await fetch(`../content/${storyId}/data.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${storyId} data`);
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching story data:", error);
        return null;
    }
}

/**
 * होम पेज पर सभी स्टोरीज़ को लोड करता है।
 * @param {Array<string>} storyIds - सभी उपलब्ध स्टोरी IDs
 */
async function loadHomeStories(storyIds) {
    const container = document.getElementById('stories-container');
    if (!container) return;

    const savedStories = getSavedStories();
    const currentLang = localStorage.getItem('storyLang') || DEFAULT_LANG;

    for (const storyId of storyIds) {
        const data = await fetchStoryData(storyId);
        if (data) {
            const cardHtml = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <a href="content/${storyId}/story.html?id=${storyId}" class="text-decoration-none text-dark">
                        <div class="card story-card">
                            <img src="${data.image}" class="card-img-top" alt="${data.title[currentLang] || data.title[DEFAULT_LANG]}">
                            <div class="card-body">
                                <h5 class="card-title">${data.title[currentLang] || data.title[DEFAULT_LANG]}</h5>
                                <p class="card-text"><small class="text-muted">${data.category}</small></p>
                                <span class="badge bg-primary">${savedStories.includes(storyId) ? 'Saved' : 'View'}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        }
    }
}

/**
 * स्टोरी पेज पर कंटेंट लोड करता है और बटन इवेंट्स सेट करता है।
 * @param {string} storyId - वर्तमान स्टोरी ID
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

    if (heroImg) heroImg.src = data.image;

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
        updateSaveButton(); // Initial state
    }

    // Language Switcher Function
    const renderContent = (lang) => {
        const effectiveLang = data.content[lang] ? lang : DEFAULT_LANG;
        const langCode = data.content[effectiveLang] ? effectiveLang : Object.keys(data.content)[0];

        if (titleElement) titleElement.textContent = data.title[langCode] || data.title[DEFAULT_LANG] || 'Story Title';
        if (contentElement) {
            contentElement.innerHTML = data.content[langCode].map(p => `<p>${p}</p>`).join('');
        }
        if (langBtn) langBtn.textContent = `Lang: ${langCode.toUpperCase()}`;

        localStorage.setItem('storyLang', langCode);
    };

    // Language Button Setup
    if (langBtn) {
        const availableLangs = ['en', 'hi', 'bn'].filter(lang => data.content[lang]);
        let langIndex = availableLangs.indexOf(currentLang);
        if (langIndex === -1) langIndex = 0; // Fallback to first available lang

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
                        <img src="${data.image}" class="rounded-start" style="width: 100px; height: 100px; object-fit: cover;" alt="${data.title[currentLang] || data.title[DEFAULT_LANG]}">
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

            // Remove card from DOM if successfully unsaved
            if (!newStatus) {
                document.getElementById(`saved-card-${storyId}`).remove();
                if (getSavedStories().length === 0) {
                    loadSavedPage(); // Reload to show 'No stories saved' message
                }
            }
        });
    });
}


// Event listeners based on the current page
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on
    const path = window.location.pathname;
    
    if (path.endsWith('index.html') || path === '/') {
        // Example story IDs - add all your story folder names here
        const storyIds = ['story1', 'story2']; 
        loadHomeStories(storyIds);
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
