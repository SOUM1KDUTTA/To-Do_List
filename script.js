// Load saved todos from localStorage when the page loads
let draggedItem = null;
document.addEventListener('DOMContentLoaded', function() {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    savedTodos.forEach(todo => {
      addTodo(todo.text,todo.dueDate, todo.priority, todo.completed); // Pass completion status
    });
  });
  
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  
  todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    const dueDate = document.getElementById('due-date').value;
    const priority = document.getElementById('priority').value;
  
    if (taskText) {
      addTodo(taskText, dueDate, priority);
      todoInput.value = '';
    }
  });
  
  function addTodo(taskText, dueDate, priority, isCompleted = false) { // Add isCompleted parameter
    const li = document.createElement('li');
    li.draggable = true;
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragend', handleDragEnd);
    li.innerHTML = `
      <span class="drag-handle">☰</span>
      <span class="task-text">${taskText}</span> <!-- Added specific class -->
        ${dueDate ? `<span class="due-date">${dueDate}</span>` : ''}
        ${priority ? `<span class="priority ${priority}">${priority}</span>` : ''}
      <button class="delete-btn">🗑️</button> <!-- Bin emoji here -->
    `;
    // Double-click to edit
const taskSpan = li.querySelector('span');
taskSpan.addEventListener('dblclick', function() {
  const originalText = taskSpan.textContent;
  
  // Create an input field
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = originalText;
  
  // Replace span with input
  taskSpan.replaceWith(editInput);
  editInput.focus();

  // Save on Enter key or blur (clicking away)
  editInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveEdit();
    }
  });

  editInput.addEventListener('blur', saveEdit);

  function saveEdit() {
    const newText = editInput.value.trim();
    if (newText) {
      taskSpan.textContent = newText;
    }
    editInput.replaceWith(taskSpan); // Restore the span
    updateLocalStorage(); // Save changes
  }
});
  
    // Apply "completed" class if needed (for loaded todos)
    if (isCompleted) {
      li.classList.add('completed');
    }
  
    // Toggle completion and update localStorage
    li.addEventListener('click', function() {
      li.classList.toggle('completed');
      updateLocalStorage();
    });
  
    // Delete todo and update localStorage
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      li.remove();
      updateLocalStorage();
    });
  
    todoList.appendChild(li);
    updateLocalStorage();
  }
  function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
  }
  
  function handleDragEnd(e) {
    draggedItem = null;
    this.classList.remove('dragging');
    updateLocalStorage
  }
  todoList.addEventListener('dragover', handleDragOver);
  todoList.addEventListener('drop', handleDrop);

  function handleDragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(todoList, e.clientY);
    const currentItem = draggedItem;
    
    if (afterElement == null) {
      todoList.appendChild(currentItem);
    } else {
      todoList.insertBefore(currentItem, afterElement);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
  }
  
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
  
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  // Unified function to save todos to localStorage
  function updateLocalStorage() {
    const todos = Array.from(todoList.children).map(li => ({
      text: li.querySelector('span:not(.drag-handle)').textContent,
      dueDate: li.querySelector('.due-date')?.textContent || '',
      priority: li.querySelector('.priority')?.textContent || 'low',
      completed: li.classList.contains('completed')
    }));
    localStorage.setItem('todos', JSON.stringify(todos));
  }