const $input = document.querySelector("input[type='number']"); // 숫자입력창
const $btn = document.querySelector("input[type='button']"); // 확인버튼

// 자리배치도 그리는 함수
function renderSeat() {
  const maxSeat = 100; // 최대 수용 가능한 인원
  let message = ""; // 경고 메시지 초기화
  let seatHTML = ""; // 자리배치도 초기화
  console.log("자리배치도그리기");
  // 1. 입력한 인원 가져오기
  const inputNumber = document.querySelector("input[type='number']").value;
  console.log(inputNumber);
  // 2. 최대 수용 가능한 인원보다 크면 경고메시지 뿌리기
  if (inputNumber > maxSeat) {
    message = `최대 수용 가능 인원은 ${maxSeat}명입니다.`;
  } else {
    // 3. 최대 수용 가능한 인원보다 작으면 자리배치도 그리기
    for (let i = 0; i <= inputNumber; i++) {
      seatHTML += `<div class="seat">${i}</div>`;
    }
  }
  document.querySelector(".message").textContent = message;
  document.querySelector("#seat-container").innerHTML = seatHTML;
}

// 버튼을 클릭했을 때 이벤트 핸들러 등록
$btn.addEventListener("click", renderSeat);
// 숫자입력창에서 엔터키를 눌렀을 때 이벤트핸들러 등록

$input.addEventListener("keyup", (e) => {
  if (e.key == "Enter") renderSeat();
});
