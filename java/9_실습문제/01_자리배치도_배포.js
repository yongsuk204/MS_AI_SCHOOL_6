const $input = document.querySelector("input[type='number']");
const $button = document.querySelector("input[type='button']");

function randomSeat() {
  const maxSeat = 100; // 최대 수용가능 인원
  let seatHTML = "";
  // 입력된 수 가져오기
  const inputNumber = document.querySelector("input[type='number']").value;
  // 입력된 수가 100보다 크면 ~ 경고메시지 뿌리기
  if (maxSeat < inputNumber) {
    // console.log("경고메시지 뿌리기");
    let message = `최대 수용 가능인원은 ${maxSeat}명 입니다.`;
    document.querySelector(".message").textContent = message;
    document.querySelector("#seat-container").innerHTML = seatHTML;
  } else {
    // console.log("자리배치도 뿌리기");
    document.querySelector(".message").textContent = "";
    for (let i = 1; i < Number(inputNumber) + 1; i++) {
      seatHTML += `<div class="seat">${i}</div>`;
      document.querySelector("#seat-container").innerHTML = seatHTML;
    }
  }
  console.log(seatHTML);
  //  자리배치도 그리기
}

// 버튼을 눌렀을때 이벤트 핸들러 등록
$button.addEventListener("click", randomSeat);
// 숫자 입력창에서 엔터키를 눌렀을때 이벤트 핸들러 등록
$input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") randomSeat();
});
// console.log(inputNumber);
