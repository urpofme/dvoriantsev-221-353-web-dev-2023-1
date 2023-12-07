function createAuthorElement(record) {
    let user = record.user || { 'name': { 'first': '', 'last': '' } };
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count && (info.current_page - 1) * info.per_page + 1;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
}

function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        btn = createPageBtn(i, i == info.current_page ? ['active'] : []);
        buttonsContainer.append(btn);
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

function downloadData(page = 1, query = '') {
    let factsList = document.querySelector('.facts-list');
    let url = new URL(factsList.dataset.url);
    let perPage = document.querySelector('.per-page-btn').value;

    url.searchParams.set('page', page);
    url.searchParams.set('per-page', perPage);
    if (query) {
        url.searchParams.set('q', query);
    }

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            renderRecords(this.response.records);
            setPaginationInfo(this.response['_pagination']);
            renderPaginationElement(this.response['_pagination']);
        } else {
            console.error('Server error:', this.status, this.statusText);
        }
    };
    xhr.onerror = function () {
        console.error('Network error');
    };
    xhr.send();
}

function searchFormHandler(event) {
    event.preventDefault();
    let searchQuery = document.querySelector('.search-field').value.trim();
    downloadData(1, searchQuery);
}

window.onload = function () {
    downloadData();
    document.querySelector('.pagination').addEventListener('click', pageBtnHandler);
    document.querySelector('.per-page-btn').addEventListener('change', perPageBtnHandler);
    document.querySelector('.search-form').addEventListener('submit', searchFormHandler);
};

function perPageBtnHandler(event) {
    downloadData(1);
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0);
    }
}

function fetchAutocomplete(query) {
    let url = new URL('http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete');
    url.searchParams.set('q', query);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateSuggestionsList(data);
        })
        .catch(error => console.error('Error fetching autocomplete suggestions:', error));
}

function updateSuggestionsList(suggestions) {
    let suggestionsList = document.querySelector('.suggestions');
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = suggestions.length ? 'block' : 'none';

    suggestions.forEach(suggestion => {
        let li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
            let searchField = document.querySelector('.search-field');
            searchField.value = suggestion;
            suggestionsList.style.display = 'none';
            downloadData(1, suggestion);
        });
        suggestionsList.appendChild(li);
    });
}

document.querySelector('.search-field').addEventListener('input', (event) => {
    let query = event.target.value;
    if (query.length > 0) {
        fetchAutocomplete(query);
    } else {
        document.querySelector('.suggestions').style.display = 'none';
    }
});

document.addEventListener('click', (event) => {
    if (!event.target.matches('.search-field')) {
        document.querySelector('.suggestions').style.display = 'none';
    }
});