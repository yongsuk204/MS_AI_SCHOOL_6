// 함수 호출
console.log(add(3, 4));

// 두 수를 더한 값을 리턴하는 함수 정의
function add(x, y) {
  return x + y;
}
console.log("=========");

const add2 = function (x, y) {
  return x + y;
};

console.log(add2(1, 2));

console.log("=========");

const add3 = (x, y) => {
  return x + y;
};
console.log(add3(1, 3));

// 홀수짝수 구별하는 함수 선언문 3가지
function isEvenOrOdd(num) {
  if (num % 2 === 0) {
    return "짝수";
  } else {
    return "홀수";
  }
}

console.log(isEvenOrOdd(10)); // "짝수"
console.log(isEvenOrOdd(7)); // "홀수"

const isEvenOrOdd = function (num) {
  return num % 2 === 0 ? "짝수" : "홀수";
};

console.log(isEvenOrOdd(10)); // "짝수"
console.log(isEvenOrOdd(7)); // "홀수"

const isEvenOrOdd = (num) => (num % 2 === 0 ? "짝수" : "홀수");

console.log(isEvenOrOdd(10)); // "짝수"
console.log(isEvenOrOdd(7)); // "홀수"
