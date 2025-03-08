const $btnCal = document.querySelector("input[type='button']"); // 계산하기버튼
function cal() {
  // 이전에 그려진 내용 삭제 후 시작
  document.getElementById("simulation").innerHTML = "";

  // 입력한 데이터 받아오기(입력받은 데이터는 string형이므로 형 변환 필요)
  let nowSaving = parseInt(document.querySelector("input[name='now']").value);
  const goalSaving = parseInt(
    document.querySelector("input[name='goal']").value
  );
  const weekSaving = parseInt(
    document.querySelector("input[name='week']").value
  );
  // console.log(weekSaving, typeof weekSaving);

  // 목표 저금액보다 작거나 같은동안 반복하여 요소 추가하기
  let li, div1, div2, text1, text2;
  let weekCnt = 1;
  while (nowSaving < goalSaving) {
    nowSaving = nowSaving + weekSaving;

    // 노드 생성
    li = document.createElement("li");
    div1 = document.createElement("div");
    div2 = document.createElement("div");
    text1 = document.createTextNode(`${weekCnt}주차 저금액`);
    text2 = document.createTextNode(`${nowSaving.toLocaleString()}원`);

    // 노드 추가
    ol = document.getElementById("simulation");
    ol.appendChild(li);
    li.appendChild(div1);
    li.appendChild(div2);
    div1.appendChild(text1);
    div2.appendChild(text2);

    // 클래스 추가
    div1.classList.add("weeks");
    div2.classList.add("now-saving");
    weekCnt++;
  }
}

$btnCal.addEventListener("click", cal); // 이벤트핸들러 등록
