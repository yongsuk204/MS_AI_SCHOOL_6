const $input = document.querySelector("input[type='number']");
const $btn = document.querySelector("input[type='button']");

function renderSeat() {
  const maxSeat = 100; //최대 수용 가능한 인원
  let message = "";
  let seatHTML = "";

  //1. 입력된 수 가져오기
  const inputNumber = document.querySelector("input[type='number']").value;
  //   const inputNumber = $input.value;

  //2. 입력된 수가 maxSeat보다 크면 경고메시지 뿌리기 아니면 자리배치도 그리기
  if (maxSeat < inputNumber) {
    message = `최대 수용 가능한 인원은 ${maxSeat}명입니다.`;
  } else {
    console.log("자리배치도 그리기");
    for (let i = 1; i <= inputNumber; i++) {
      seatHTML += `<div class="seat">${i}</div>`;
    }
  }
  document.querySelector(".message").textContent = message;
  document.querySelector("#seat-container").innerHTML = seatHTML;
}

// 버튼을 클릭했을을 때 이벤트 핸들러 등록
$btn.addEventListener("click", renderSeat);

// 숫자입력창에서 엔터키를 눌렀을 때 이벤트 핸들러 등록
$input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") renderSeat();
});

console.log($btn);
