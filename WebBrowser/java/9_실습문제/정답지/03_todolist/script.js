const $inputTodo = document.getElementById("input-todo");
const $btnAdd = document.getElementById("btn-add");

let todoArray = [];

function addTodo() {
  // 입력된 값을 가져온다.
  const todoText = $inputTodo.value;

  // 입력된 값이 없으면 함수를 빠져나온다.
  if (todoText.trim() === "") return;

  // 할 일 배열에 데이터를 추가한다.
  todoArray.push({
    id: Date.now(),
    todoText: todoText,
    isComplete: false,
  });

  console.log(todoArray);

  // html에 할일 목록을 렌더링한다.
  renderTodos();

  // 웹스토리지에 할 일 목록 업데이트
  saveWebStorage();

  // 다음 입력을 받기 위해 입력창의  값 지우기
  $inputTodo.value = "";
}

function renderTodos() {
  // 기존의 목록을 지우고 다시 쓴다.
  let $ol = document.getElementById("todo-list");
  $ol.innerHTML = "";
  let $li, $input, $span, $button, $spanText, $buttonText;
  for (idx in todoArray) {
    // 요소노드
    $li = document.createElement("li");
    $input = document.createElement("input");
    $span = document.createElement("span");
    $button = document.createElement("button");

    // 요소 속성
    $li.setAttribute("class", "todo-item");
    $input.setAttribute("type", "checkbox");
    $button.setAttribute("class", "delete-btn");
    $button.setAttribute("onclick", `deleteTodo(${todoArray[idx].id})`);
    $input.setAttribute("onchange", `toggleComplete(${todoArray[idx].id})`);

    if (todoArray[idx].isComplete === true) {
      $input.setAttribute("checked", "checked");
      $span.setAttribute("class", "completed");
    }

    //텍스트노드
    $spanText = document.createTextNode(`${todoArray[idx].todoText}`);
    $buttonText = document.createTextNode("삭제");

    // 노드 구성
    $ol.appendChild($li);
    $li.appendChild($input);
    $li.appendChild($span);
    $li.appendChild($button);
    $span.appendChild($spanText);
    $button.appendChild($buttonText);
  }
}

function saveWebStorage() {
  localStorage.setItem("todos", JSON.stringify(todoArray));
}

function loadTodos() {
  if (!localStorage.getItem("todos")) return;
  todoArray = localStorage.getItem("todos");
  todoArray = JSON.parse(todoArray);
  renderTodos();
}
loadTodos(); // 페이지가 로드될 때(새로고침 할 때마다) 호출

function deleteTodo(todoId) {
  todoArray = todoArray.filter((todo) => todo.id !== todoId);
  renderTodos();
  saveWebStorage();
}

function toggleComplete(todoId) {
  for (let idx in todoArray) {
    if (todoArray[idx].id == todoId) {
      todoArray[idx].isComplete = !todoArray[idx].isComplete;
      break;
    }
  }
  saveWebStorage();
  renderTodos();
}
//
$inputTodo.addEventListener("keyup", (e) => {
  if (e.key === "Enter") addTodo();
});

$btnAdd.addEventListener("click", addTodo);
