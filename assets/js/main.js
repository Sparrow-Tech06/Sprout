document.addEventListener('DOMContentLoaded', () => {
    // Determine the current story path dynamically (e.g., 'story1')
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    const storyFolder = pathSegments[pathSegments.length - 2]; // Gets 'story1'

    const langSwitcher = document.getElementById('language-switcher');
    let currentLang = langSwitcher ? langSwitcher.value : 'eng'; // Default from select or 'eng'

    const storyImage = document.getElementById('story-main-image');
    const imageWrapper = document.getElementById('image-wrapper');

    /**
     * Fetches story data from data.json
     * @returns {Promise<Object>} The story data object.
     */
    async function fetchStoryData() {
        try {
            const response = await fetch(`../${storyFolder}/data.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.error('Error fetching story data:', e);
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
        
        // --- Image Loading Handling ---
        // 1. Set the image source (which triggers the load)
        storyImage.src = data.image_url;
        // 2. Add listener to remove skeleton when image is loaded
        storyImage.onload = () => {
            imageWrapper.classList.remove('skeleton-box'); // Remove skeleton animation
            storyImage.style.display = 'block';           // Show the image
        };
        // 3. Handle image loading error (optional)
        storyImage.onerror = () => {
            console.error('Failed to load story image.');
            imageWrapper.classList.remove('skeleton-box'); 
            // Optionally, show a broken image icon or a fallback background
        };


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
    }

    // Initialize the story page
    fetchStoryData().then(data => {
        if (data) {
            renderStory(data);

            // Add event listener for the SELECT language switcher
            if (langSwitcher) {
                langSwitcher.addEventListener('change', (event) => {
                    currentLang = event.target.value;
                    renderStory(data); // Re-render with new language
                });
            }
        }
    });
});

