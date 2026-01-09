document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule');
    const searchInput = document.getElementById('categorySearch');
    let allTalks = [];

    // Fetch the schedule data
    fetch('/api/schedule')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allTalks = data;
            renderSchedule(allTalks);
        })
        .catch(error => {
            console.error('Error fetching schedule:', error);
            scheduleContainer.innerHTML = '<div class="loading">Error loading schedule. Please try again later.</div>';
        });

    // Search/Filter Event Listener
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterSchedule(query);
    });

    function filterSchedule(query) {
        if (!query) {
            renderSchedule(allTalks);
            return;
        }

        const filtered = allTalks.filter(item => {
            // Filter by category
            const matchCategory = item.category && Array.isArray(item.category) && 
                item.category.some(cat => cat.toLowerCase().includes(query));
            
            // Filter by speakers
            const matchSpeaker = item.speakers && Array.isArray(item.speakers) && 
                item.speakers.some(speaker => speaker.toLowerCase().includes(query));

            return matchCategory || matchSpeaker;
        });

        renderSchedule(filtered);
    }

    function renderSchedule(items) {
        scheduleContainer.innerHTML = '';

        if (items.length === 0) {
            scheduleContainer.innerHTML = '<div class="no-results">No talks found matching your query.</div>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = `schedule-item ${item.type}`;
            
            // Speakers formatting
            let speakersHtml = '';
            if (item.speakers && item.speakers.length > 0) {
                speakersHtml = `<span class="speaker-list">👤 ${item.speakers.join(', ')}</span>`;
            }

            // Categories formatting
            let tagsHtml = '';
            if (item.category && item.category.length > 0) {
                tagsHtml = `<div class="tags">${item.category.map(cat => `<span class="tag">${cat}</span>`).join('')}</div>`;
            }

            // Time formatting logic
            const timeHtml = `
                <div class="item-time">
                    <span class="time-start">${item.startTime}</span>
                    <span class="time-end">${item.endTime}</span>
                </div>
            `;

            // Content
            const contentHtml = `
                <div class="item-content">
                    <h2 class="item-title">${item.title}</h2>
                    ${item.type === 'talk' ? 
                        `<div class="item-meta">
                            ${speakersHtml}
                            <span>⏱ ${item.duration}</span>
                        </div>` 
                        : ''}
                    <p class="item-description">${item.description}</p>
                    ${item.type === 'talk' && tagsHtml ? `<div class="item-meta" style="margin-top:10px">${tagsHtml}</div>` : ''}
                </div>
            `;

            card.innerHTML = timeHtml + contentHtml;
            scheduleContainer.appendChild(card);
        });
    }

    // Back to Top Logic
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
