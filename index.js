document.addEventListener('DOMContentLoaded', () => {
    let allItems = []; // To store all items fetched
    let allAssets = []; // To store all assets fetched
    let currentItems = []; // To store currently displayed items
    const itemsPerPage = 12;
    let currentPage = 1;
    let totalPages = 1;

    const cardContainer = document.getElementById('card-container');
    const searchBar = document.getElementById('search-bar');
    const bookCounter = document.getElementById('book-counter');
    const loadingSpinner = document.getElementById('loading-spinner');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const firstPageButton = document.getElementById('first-page');
    const lastPageButton = document.getElementById('last-page');
    const pageInfo = document.getElementById('page-info');

    // Show spinner initially
    loadingSpinner.style.display = 'block';

    fetchWithMinimumTime('https://cdn.contentful.com/spaces/8zoc71bjmkl3/entries?access_token=', 1000)
        .then(data => {
            allItems = data.items;
            allAssets = data.includes.Asset;
            totalPages = Math.ceil(allItems.length / itemsPerPage);
            currentPage = 1;
            currentItems = allItems.slice(0, itemsPerPage);
            displayCards(currentItems, allAssets);
            updateCounter(allItems.length);
            updatePageInfo();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        })
        .finally(() => {
            loadingSpinner.style.display = 'none';
        });

    function fetchWithMinimumTime(url, minTime) {
        return Promise.all([
            fetch(url).then(response => response.json()),
            new Promise(resolve => setTimeout(resolve, minTime))
        ]).then(([data]) => data);
    }

    function normalizeString(str) {
        return str.replace(/[^\w\s]/gi, '').toLowerCase();
    }

    function displayCards(items, assets) {
        cardContainer.innerHTML = "";
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';

            const title = document.createElement('h2');
            title.textContent = item.fields.book || "No Book Title Available";

            card.appendChild(title);

            const imageId = item.fields.image?.sys?.id;
            const imageAsset = assets.find(asset => asset.sys.id === imageId);

            if (imageAsset && imageAsset.fields && imageAsset.fields.file) {
                const image = document.createElement('img');
                image.src = imageAsset.fields.file.url;
                card.appendChild(image);
            }

            cardContainer.appendChild(card);
        });
    }

    function updateCounter(count, searchString = '') {
        if (searchString) {
            bookCounter.textContent = `Archer has ${count} book${count !== 1 ? 's' : ''} matching "${searchString}"`;
        } else {
            bookCounter.textContent = `Archer has ${count} book${count !== 1 ? 's' : ''}`;
        }
    }

    function updatePageInfo({ showPaging } = { showPaging: true }) {
        if (showPaging) {
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            prevPageButton.disabled = currentPage === 1;
            nextPageButton.disabled = currentPage === totalPages;
            firstPageButton.disabled = currentPage === 1;
            lastPageButton.disabled = currentPage === totalPages;
            prevPageButton.style.display = 'inline-block';
            firstPageButton.style.display = 'inline-block';
            nextPageButton.style.display = 'inline-block';
            lastPageButton.style.display = 'inline-block';
        } else {
            pageInfo.textContent = '';
            prevPageButton.style.display = 'none';
            firstPageButton.style.display = 'none';
            nextPageButton.style.display = 'none';
            lastPageButton.style.display = 'none';
        }
    }

    searchBar.addEventListener('keyup', (e) => {
        const searchString = normalizeString(e.target.value);
        if (searchString) {
            const filteredItems = allItems.filter(item =>
                normalizeString(item.fields.book).includes(searchString)
            );
            displayCards(filteredItems, allAssets);
            updateCounter(filteredItems.length, searchString);
            updatePageInfo({ showPaging: false });
        } else {
            currentPage = 1;
            totalPages = Math.ceil(allItems.length / itemsPerPage);
            currentItems = allItems.slice(0, itemsPerPage);
            displayCards(currentItems, allAssets);
            updateCounter(allItems.length);
            updatePageInfo();
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePageContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePageContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    firstPageButton.addEventListener('click', () => {
        if (currentPage !== 1) {
            currentPage = 1;
            updatePageContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    lastPageButton.addEventListener('click', () => {
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            updatePageContent();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    function updatePageContent() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = currentPage * itemsPerPage;
        currentItems = allItems.slice(startIndex, endIndex);
        displayCards(currentItems, allAssets);
        updatePageInfo();
    }
});