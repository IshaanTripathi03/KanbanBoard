const form = document.querySelector('#task-form');
const todoList = document.querySelector('#todo-lane');
const tasks = document.querySelectorAll(".task")
const taskLanes = document.querySelectorAll('.tasks-lane');
const saveBtn = document.querySelector("#save");
const syncBtn = document.querySelector('#sync');

let todoItems = [];
let doingItems = [];
let doneItems = [];

let source = null;
let target = null;

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // capturing user input
    const task = event.target[0].value;
    if (task.length) {
        // creation of html tags
        const div = document.createElement('div');
        const para = document.createElement('p');
    
        // specifying attributes and content to the newly created html tags
        para.innerText = task;
        div.className = 'task';
        div.setAttribute('draggable', 'true');

        div.addEventListener('dragstart', (e) =>  {
            div.classList.add('is-dragging')
            source = e.target.parentNode.id;
        });
        div.addEventListener('dragend', (e) => {
            div.classList.remove('is-dragging');
            target = e.target.parentNode.id;
            recalculateTasksArr(task);
        });
       
        todoItems.push(task);
     
        // appending the html tags accordingly
        div.appendChild(para);
        todoList.appendChild(div);
        event.target[0].value = "";
    } else {
        alert('Your task is either empty or it exceeds the max length limit of 20 characters')
    }
});

taskLanes.forEach(phase => {
    phase.addEventListener('dragover', (e) => {

        e.preventDefault();
        const bottomTask = closestSibling(phase, e.clientY);
        const currentTask = document.querySelector('.is-dragging');
        if (!bottomTask) {
            phase.appendChild(currentTask)
        } else {
          phase.insertBefore(currentTask, bottomTask);
        }
    })
});

function recalculateTasksArr(task) {
    let sourceArr = [];
    let targetArr = [];

    if (source === "todo-lane") {
        sourceArr = [...todoItems];
    } else if (source === "doing-lane") {
        sourceArr = [...doingItems]
    } else {
        sourceArr = [...doneItems];
    }

    if (target === "todo-lane") {
        targetArr = [...todoItems];
    } else if (target === "doing-lane") {
        targetArr = [...doingItems]
    } else {
        targetArr = [...doneItems];
    }

  

    const taskIndex = sourceArr.findIndex((el) => el === task);
    sourceArr.splice(taskIndex,1);
    targetArr.push(task);


    if (source === "todo-lane") {
        todoItems = sourceArr;
    } else if (source === "doing-lane") {
        doingItems = sourceArr
    } else {
        doneItems = sourceArr;
    }

    if (target === "todo-lane") {
        todoItems = targetArr;
    } else if (target === "doing-lane") {
        doingItems = targetArr
    } else {
        doneItems = targetArr;
    }

    console.log(todoItems, doingItems, doneItems)
}

function closestSibling(phase, mouseY) {
    const els = phase.querySelectorAll(".task:not(.is-dragging)");
    let closestTask = null;
    let closestOffset = -100000000000000;

    els.forEach(task => {
        const {top} = task.getBoundingClientRect();
        const offset = (mouseY - top);

        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
        }
    });
    return closestTask;
}

saveBtn.addEventListener('click', () => {
    const tasks = JSON.stringify({
        todo: todoItems,
        doing: doingItems,
        done: doneItems
    });
    localStorage.setItem('tasks', tasks);
    alert('Sucessfully saved')
});

syncBtn.addEventListener('click', () => {
    const stored = localStorage.getItem('tasks');
    
    if (stored) {
        const parsedStored = JSON.parse(stored);

        if (parsedStored.todo && parsedStored.doing && parsedStored.done) {
            todoItems = [...parsedStored.todo];
            doingItems = [...parsedStored.doing];
            doneItems = [...parsedStored.done];
            console.log("Tasks synced:", { todoItems, doingItems, doneItems });
            
            renderTasks();
        } else {
            console.log("Invalid structure in stored data.");
        }
    } else {
        console.log("No tasks found in localStorage.");
    }
});

const doingLane = document.querySelector('#doing-lane'); 
const doneLane = document.querySelector('#done-lane');

function renderTasks() {

    const todoHeader = todoList.querySelector('h3');
    const doingHeader = doingLane.querySelector('h3');
    const doneHeader = doneLane.querySelector('h3');

    todoList.innerHTML = '';
    todoList.appendChild(todoHeader);

    doingLane.innerHTML = '';
    doingLane.appendChild(doingHeader);

    doneLane.innerHTML = '';
    doneLane.appendChild(doneHeader);

    todoItems.forEach(task => {
        const div = createTaskElement(task);
        todoList.appendChild(div);
    });

    doingItems.forEach(task => {
        const div = createTaskElement(task);
        doingLane.appendChild(div);
    });

    doneItems.forEach(task => {
        const div = createTaskElement(task);
        doneLane.appendChild(div);
    });
}
function createTaskElement(task) {
    const div = document.createElement('div');
    const para = document.createElement('p');
    
    para.innerText = task;
    div.className = 'task';
    div.setAttribute('draggable', 'true');

    div.addEventListener('dragstart', (e) => {
        div.classList.add('is-dragging');
        source = e.target.parentNode.id;
    });
    div.addEventListener('dragend', (e) => {
        div.classList.remove('is-dragging');
        target = e.target.parentNode.id;
        recalculateTasksArr(task);
    });

    div.appendChild(para);
    return div;
}
