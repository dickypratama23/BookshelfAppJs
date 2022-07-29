const books = [];
let booksFilter = [];
const RENDER_EVENT = 'render-book';
const FILTER_EVENT = 'render-book-filter';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const submitForm = document.getElementById('formBuku');
    submitForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addBook();
    })

    const buttonEdit = document.getElementById('btnEdit');
    buttonEdit.addEventListener('click', function (e) {
        editBook();
    })

    const buttonSearch = document.getElementById('btnSearch');
    buttonSearch.addEventListener('click', function (e) {
        searchBook(books);
    })

    const buttonReset = document.getElementById('btnReset');
    buttonReset.addEventListener('click', function (e) {
        document.dispatchEvent(new Event(RENDER_EVENT));
    })
})

function addBook() {
    const id = generateId();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const isComplete = document.getElementById('isComplete').checked;

    const bookObject = generateBookObject(id, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.getElementById('formBuku').reset();
    saveData();
}

function editBook() {
    const id = document.getElementById('id').value;
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const isComplete = document.getElementById('isComplete').checked;

    const bookIndex = books.findIndex((book => book.id == id));
    books[bookIndex].title = title;
    books[bookIndex].author = author;
    books[bookIndex].year = year;
    books[bookIndex].isComplete = isComplete;

    document.getElementById('btnSave').removeAttribute('disabled');
    document.getElementById('btnEdit').setAttribute('disabled', true);

    document.dispatchEvent(new Event(RENDER_EVENT));
    document.getElementById('formBuku').reset();
    saveData();
}

function searchBook() {
    const search = document.getElementById('search').value;
    const bookFilter = books.filter(book => book.title.toLowerCase().includes(search));
    document.getElementById('search').value = "";

    booksFilter = [...bookFilter];
    document.dispatchEvent(new Event(FILTER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const newBookLists = document.getElementById('newBook');
    newBookLists.innerHTML = '';

    const bookHasReads = document.getElementById('hasRead');
    bookHasReads.innerHTML = '';

    for (const bookItem of books) {
        const itemElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            newBookLists.append(itemElement);
        } else {
            bookHasReads.append(itemElement);
        }

    }
});

document.addEventListener(FILTER_EVENT, function () {
    const newBookLists = document.getElementById('newBook');
    newBookLists.innerHTML = '';

    const bookHasReads = document.getElementById('hasRead');
    bookHasReads.innerHTML = '';

    for (const bookItem of booksFilter) {
        const itemElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            newBookLists.append(itemElement);
        } else {
            bookHasReads.append(itemElement);
        }

    }
});

function makeBook(bookObject) {
    const icon = !bookObject.isComplete ? 'fa-check' : 'fa-ban';
    const text = !bookObject.isComplete ? 'Sudah Baca' : 'Belum Baca';

    // Detail Data

    const textTitle = document.createElement('div');
    textTitle.classList.add('title');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('div');
    textAuthor.classList.add('author');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('div');
    textYear.classList.add('year');
    textYear.innerText = bookObject.year;

    const textAuthorYear = document.createElement('div');
    textAuthorYear.classList.add('author-year');
    textAuthorYear.append(textAuthor, textYear);

    const textDetail = document.createElement('div');
    textDetail.classList.add('detail');
    textDetail.append(textTitle, textAuthorYear);

    // Button Action

    const textTooltipRead = document.createElement('span');
    textTooltipRead.classList.add('tooltipText');
    textTooltipRead.innerText = text;

    const buttonIconRead = document.createElement('i');
    buttonIconRead.classList.add('fa', icon, 'tooltip');
    buttonIconRead.append(textTooltipRead);

    buttonIconRead.addEventListener('click', function () {
        if (bookObject.isComplete) {
            bookToRead(bookObject.id);
        } else {
            bookToHasRead(bookObject.id)
        }
    });

    const textTooltipEdit = document.createElement('span');
    textTooltipEdit.classList.add('tooltipText');
    textTooltipEdit.innerText = 'Ubah Buku';

    const buttonIconEdit = document.createElement('i');
    buttonIconEdit.classList.add('fa', 'fa-pencil', 'tooltip');
    buttonIconEdit.append(textTooltipEdit);

    buttonIconEdit.addEventListener('click', function () {
        bookEdit(bookObject.id);
    });

    const textTooltipDelete = document.createElement('span');
    textTooltipDelete.classList.add('tooltipText');
    textTooltipDelete.innerText = 'Hapus Buku';

    const buttonIconDelete = document.createElement('i');
    buttonIconDelete.classList.add('fa', 'fa-trash', 'tooltip');
    buttonIconDelete.append(textTooltipDelete);

    buttonIconDelete.addEventListener('click', function () {
        bookDelete(bookObject.id);
    });

    const actionButton = document.createElement('div');
    actionButton.classList.add('action');
    actionButton.append(buttonIconRead, buttonIconEdit, buttonIconDelete);

    const item = document.createElement('li');
    item.classList.add('item');
    item.append(textDetail, actionButton);
    item.setAttribute('id', `book-${bookObject.id}`);

    return item;
}

function bookEdit(bookId) {
    const bookTarget = findBook(bookId);

    document.getElementById('id').value = bookTarget.id;
    document.getElementById('title').value = bookTarget.title;
    document.getElementById('author').value = bookTarget.author;
    document.getElementById('year').value = bookTarget.year;
    document.getElementById('isComplete').checked = bookTarget.isComplete;
    document.getElementById('btnSave').setAttribute('disabled', true);
    document.getElementById('btnEdit').removeAttribute('disabled');
}

function bookDelete(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function bookToRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function bookToHasRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    localStorage.getItem(STORAGE_KEY);
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            books.push(todo);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}