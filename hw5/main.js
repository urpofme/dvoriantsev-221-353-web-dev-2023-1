const apiKey = '50d2199a-42dc-447d-81ed-d68a443b697e';
const apiUrl = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';

function createTask(event) {
    let form = document.getElementById("newTaskForm");
    let taskName = form.elements['taskName'].value;
    let taskDescription = form.elements['taskDescription'].value;
    let taskStatus = form.elements['taskStatus'].value;

    // Создание новой задачи на сервере
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            api_key: apiKey,
            name: taskName,
            desc: taskDescription,
            status: taskStatus,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to create task: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // Обработка успешного ответа от сервера
        console.log('Task created successfully:', data);
        let taskInfo = {
            id: data.id,
            name: taskName,
            description: taskDescription,
            status: taskStatus,
        };
        displayTask(taskInfo);
        form.reset();
    })
    .catch(error => {
        // Обработка ошибки при создании задачи
        console.error('Error creating task:', error);
    });
}


function displayTask(taskInfo) {
    let liTemplate = document.getElementById('task-template').content.firstElementChild;
    let li = liTemplate.cloneNode(true);
    li.querySelector(".task-name").textContent = taskInfo.name;
    li.id = taskInfo.id;
    let list = document.getElementById(`${taskInfo.status}-list`);
    list.append(li);

    // отправка задачи на сервер
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            api_key: apiKey,
            name: taskInfo.name,
            desc: taskInfo.description,
            status: taskInfo.status,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // обработка успешного ответа от сервера
        console.log('Task created successfully:', data);
    })
    .catch(error => {
        // обработка ошибки при отправке запроса
        console.error('Error creating task:', error);
    });
}

function displayAllTask() {
    // Очистка текущих задач перед загрузкой новых
    document.getElementById("to-do-list").innerHTML = '';
    document.getElementById("done-list").innerHTML = '';

    // Загрузка задач с сервера
    fetch(`${apiUrl}?api_key=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load tasks: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Проверка, является ли data массивом
            if (Array.isArray(data)) {
                data.forEach(task => displayTask(task));
            } else {
                console.error('Error loading tasks: Invalid data format');
            }
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

function beforeOpenEditModal(event) {
    let button = event.relatedTarget;
    let taskNum = button.closest('.task').id;
    let taskInfo = JSON.parse(localStorage.getItem(taskNum));
    let form = event.target.querySelector('#editTaskForm');
    form.elements['taskName'].value = taskInfo.name;
    form.elements['taskDescription'].value = taskInfo.description;
    form.elements['taskStatus'].value = taskInfo.status;
    form.dataset.id = taskNum;
}

function beforeOpenShowModal(event) {
    let button = event.relatedTarget;
    let taskNum = button.closest('.task').id;
    let taskInfo = JSON.parse(localStorage.getItem(taskNum));
    let form = event.target.querySelector('#showwTaskForm');
    form.elements['taskName'].textContent = taskInfo.name;
    form.elements['taskDescription'].textContent = taskInfo.description;
    form.elements['taskStatus'].textContent = taskInfo.status;
}



function deleteTask(taskId) {
    // Удаление задачи на сервере
    fetch(`${apiUrl}/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            api_key: apiKey,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Обработка успешного ответа от сервера
        console.log('Task deleted successfully:', data);
    })
    .catch(error => {
        // Обработка ошибки при отправке запроса
        console.error('Error deleting task:', error);
    });

    // Удаление задачи из DOM
    let listItem = document.getElementById(taskId);
    listItem.remove();
}

// Добавляем обработчик клика для удаления задачи
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('fa-trash-o')) {
        let taskId = event.target.closest('.task').id;
        deleteTask(taskId);
    }
});

// Обновленный код saveTask с удалением лишнего кода
function saveTask(event) {
    let form = document.getElementById("editTaskForm");
    let taskName = form.elements['taskName'].value;
    let taskDescription = form.elements['taskDescription'].value;
    let taskStatus = form.elements['taskStatus'].value;
    let taskNum = form.dataset.id;
    let taskInfo = {
        id: taskNum,
        name: taskName,
        description: taskDescription,
        status: taskStatus 
    };

    // Обновление задачи на сервере
    fetch(`${apiUrl}/${taskNum}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            api_key: apiKey,
            name: taskInfo.name,
            desc: taskInfo.description,
            status: taskInfo.status,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Обработка успешного ответа от сервера
        console.log('Task updated successfully:', data);
    })
    .catch(error => {
        // Обработка ошибки при отправке запроса
        console.error('Error updating task:', error);
    });

    // Обновление названия задачи в DOM
    let listItem = document.getElementById(taskInfo.id);
    listItem.querySelector(".task-name").innerHTML = taskInfo.name;
}

if (!localStorage.getItem('taskNum')) {
    localStorage.setItem('taskNum', 0);
}

let createButton = document.getElementById("createTaskButton");
createButton.onclick = createTask;
window.onload = displayAllTask;

let editsaveButton = document.getElementById("saveTaskButton");
editsaveButton.onclick = saveTask;

let modal = document.getElementById("editModal");
modal.addEventListener('show.bs.modal', beforeOpenEditModal);

let showModal = document.getElementById("showTaskModal");
showModal.addEventListener('show.bs.modal', beforeOpenShowModal);