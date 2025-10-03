document.addEventListener('DOMContentLoaded', () => {
    // Determine the current story path dynamically (e.g., 'story1')
    // Assumes story.html is always inside a story folder (e.g., /content/story1/story.html)
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    const storyFolder = pathSegments[pathSegments.length - 2]; // Gets 'story1'

    let currentLang = 'eng'; // Default language

    /**
     * Fetches story data from data.json
     * @returns {Promise<Object>} The story data object.
     */
    async function fetchStoryData() {
        try {
            // Path relative to main.js: '../../content/story1/data.json'
            const response = await fetch(`../${storyFolder}/data.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.error('Error fetching story data:', e);
            // Fallback for displaying error to user
            document.getElementById('story-content').innerHTML = '<p class="text-danger">Failed to load story content.</p>';
            return null;
        }
    }

    /**
     * Renders the story content based on the current language.
     * @param {Object} data - The full story data object.
     */
    function renderStory(data) {
        if (!data) return;

        // Populate common metadata
        document.getElementById('story-category').textContent = data.category;
        document.getElementById('story-read-time').textContent = data.read_time;
        document.getElementById('story-author').textContent = data.author;
        document.getElementById('story-main-image').src = data.image_url;
        
        // Get the content for the current language
        const langContent = data[currentLang];
        
        // Update Title
        document.getElementById('story-title').textContent = langContent.title;

        // Update Content
        const contentDiv = document.getElementById('story-content');
        contentDiv.innerHTML = ''; // Clear previous content
        
        // Use array content to create paragraphs (p tags)
        langContent.content.forEach(paragraphText => {
            const p = document.createElement('p');
            p.textContent = paragraphText;
            contentDiv.appendChild(p);
        });

        // Update active button state
        document.querySelectorAll('.btn-group button').forEach(button => {
            button.classList.remove('btn-primary', 'active');
            button.classList.add('btn-outline-primary');
            if (button.getAttribute('data-lang') === currentLang) {
                button.classList.remove('btn-outline-primary');
                button.classList.add('btn-primary', 'active');
            }
        });
    }

    // Initialize the story page
    fetchStoryData().then(data => {
        if (data) {
            renderStory(data);

            // Add event listeners for language switcher buttons
            document.querySelectorAll('.btn-group button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const newLang = event.target.getAttribute('data-lang');
                    if (newLang && newLang !== currentLang) {
                        currentLang = newLang;
                        renderStory(data); // Re-render with new language
                    }
                });
            });
        }
    });
});

