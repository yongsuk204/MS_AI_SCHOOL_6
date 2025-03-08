// 요소 취득
const $inputTodo = document.getElementById("input-todo");
const $btnAdd = document.getElementById("btn-add");

const todoArray = [];
function addTodo() {
  // 입력된 값을 가져온다.
  const todoText = $inputTodo.value;

  // 입력된 값이 없을 때는 함수를 빠져나온다.
  if (todoText.trim() === "") return;

  // 할 일 배열에 데이터를 추가한다.
  todoArray.push({
    id: Date.now(),
    todoText: todoText,
    isComplete: false,
  });

  // html에 렌더링
  renderTodos();

  // 웹스토리지에 배열을 업데이트한다.
  saveWebStorage();

  // 입력창의 값을 지운다.
  $inputTodo.value = "";
}

function renderTodos() {
  console.log(todoArray);
  console.log("html렌더링");
  // <li class="todo-item">
  //   <input type="checkbox" />
  //   <span>미완료</span>
  //   <button class="delete-btn">삭제</button>
  // </li>
  // <li class="todo-item">
  //   <input type="checkbox" />
  //   <span class="completed">완료</span>
  //   <button class="delete-btn">삭제</button>
  // </li>
  let $ol = document.getElementById("todo-list");
  $ol.innerHTML = "";

  let $li, $input, $span, $button, $textSpan, $textButton;
  for (idx in todoArray) {
    // 요소노드
    $li = document.createElement("li");
    $input = document.createElement("input");
    $span = document.createElement("span");
    $button = document.createElement("button");
    // 요소의 속성
    $li.setAttribute("class", "todo-item");
    $input.setAttribute("type", "checkbox");
    $button.setAttribute("class", "delete-btn");

    // 텍스트노드
    $textSpan = document.createTextNode(`${todoArray[idx].todoText}`);
    $textButton = document.createTextNode("삭제");

    // DOM트리 구성
    $ol.appendChild($li);
    $li.appendChild($input);
    $li.appendChild($span);
    $li.appendChild($button);
    $span.appendChild($textSpan);
    $button.appendChild($textButton);
  }
}

function saveWebStorage() {
  localStorage.setItem("todos", JSON.stringify(todoArray));
}
$inputTodo.addEventListener("keyup", (e) => {
  if (e.key === "Enter") addTodo();
});

$btnAdd.addEventListener("click", addTodo);
