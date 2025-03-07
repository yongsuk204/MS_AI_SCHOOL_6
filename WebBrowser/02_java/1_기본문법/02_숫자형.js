console.log(typeof 1); // number
console.log(typeof 1.0); // number
console.log(1.0); //1
console.log((1.0).toFixed(5)); //1.00 소숫점자리수
console.log(1 == 1.0);
console.log(1 === 1.0);

// 숫자 데이터의 증감 연산
let x = 1;
let result = x++; // x을 할당 한 다음 나중에 증가
console.log(result, x);

x = 1;
result = ++x; // x를 먼저 증가시키고 할당
console.log(result, x);
