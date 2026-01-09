document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule');
    const searchInput = document.getElementById('categorySearch');
    const clearBtn = document.getElementById('clearSearch');
    const favoritesFilterBtn = document.getElementById('favoritesFilter');
    
    let allTalks = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let isFavoritesOnly = false;

    // Initialize Filter Button State
    if (favorites.length > 0) {
        // Optional: show count or style change
    }

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

    // Favorites Filter Logic
    favoritesFilterBtn.addEventListener('click', () => {
        isFavoritesOnly = !isFavoritesOnly;
        favoritesFilterBtn.classList.toggle('active', isFavoritesOnly);
        favoritesFilterBtn.setAttribute('aria-pressed', isFavoritesOnly);
        
        // Trigger filter
        const query = searchInput.value.toLowerCase().trim();
        filterSchedule(query);
    });

    // Search/Filter Event Listener
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        toggleClearButton(query);
        filterSchedule(query);
    });

    // Clear Search Logic
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearButton('');
        filterSchedule('');
        searchInput.focus();
    });

    function toggleClearButton(query) {
        if (query) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    function filterSchedule(query) {
        let filtered = allTalks;

        // 1. Filter by Search Query
        if (query) {
            filtered = filtered.filter(item => {
                const matchCategory = item.category && Array.isArray(item.category) && 
                    item.category.some(cat => cat.toLowerCase().includes(query));
                
                const matchSpeaker = item.speakers && Array.isArray(item.speakers) && 
                    item.speakers.some(speaker => speaker.toLowerCase().includes(query));

                return matchCategory || matchSpeaker;
            });
        }

        // 2. Filter by Favorites (if enabled)
        if (isFavoritesOnly) {
            filtered = filtered.filter(item => favorites.includes(item.id));
        }

        renderSchedule(filtered);
    }

    // Handle Favorite Click (Delegation)
    scheduleContainer.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.fav-btn');
        if (favBtn) {
            const id = parseInt(favBtn.dataset.id);
            toggleFavorite(id);
        }
    });

    function toggleFavorite(id) {
        const index = favorites.indexOf(id);
        if (index === -1) {
            favorites.push(id);
        } else {
            favorites.splice(index, 1);
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Re-render to update UI (icons and filter if active)
        const query = searchInput.value.toLowerCase().trim();
        filterSchedule(query);
    }

    function renderSchedule(items) {
        scheduleContainer.innerHTML = '';

        if (items.length === 0) {
            const msg = isFavoritesOnly ? 'No favorites added yet.' : 'No talks found matching your query.';
            scheduleContainer.innerHTML = `<div class="no-results">${msg}</div>`;
            return;
        }

        items.forEach(item => {
            const isFav = favorites.includes(item.id);
            const card = document.createElement('div');
            card.className = `schedule-item ${item.type}`;
            
            // Favorite Button
            const favBtnHtml = `
                <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
            `;

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

            card.innerHTML = favBtnHtml + timeHtml + contentHtml;
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
