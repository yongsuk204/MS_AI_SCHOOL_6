// 현재시간 생성 UTC 기준
const now = new Date();
console.log(now);
console.log(typeof now);

// 로컬 날짜, 시간 문자열 형태로 변환
console.log("로컬시간기준:", now.toString());
console.log("로컬시간 기준 날짜만:", now.toDateString());
console.log("로컬시간 기준 시간만:", now.toTimeString());
console.log(typeof now.toString());

//특정 날짜와 시간 생성
const christMas = new Date("2025-12-25T13:13:11.134Z"); // 맨마지막 Z 가 있으면 UTC기준 없으면 로컬기준
console.log(christMas);
// 월은 0~11로 입력
const lastday = new Date(2019, 11, 23, 23, 41, 46); // 로컬기준
console.log(lastday);

const christMas_1 = new Date(Date.UTC(2025, 11, 31, 23, 41, 46)); // UTC기준
console.log(christMas_1);

// 날짜정보 가져오기
console.log("fullYear:", lastday.getFullYear());
console.log(lastday.getDate());
console.log(lastday.getDay());
console.log(lastday.getHours());
console.log(lastday.getMinutes());
console.log(lastday.getMonth());
console.log(lastday.getTime());
console.log(lastday);

// 요일로 변환해주기 미션
const getDayName = function (x) {
  return x == 0
    ? "월요일"
    : x == 1
    ? "화요일"
    : x == 2
    ? "수요일"
    : x == 3
    ? "목요일"
    : x == 4
    ? "금요일"
    : x == 5
    ? "토요일"
    : "일요일";
};
console.log(getDayName(lastday.getDay()));
