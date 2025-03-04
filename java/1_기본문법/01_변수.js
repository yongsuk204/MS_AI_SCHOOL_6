var v1; //변수 선언
v1 = 1; // 값의 할당
console.log(v1);

// 변수를 선언하기 전에 참조하면 undifined
console.log("v2:", v2);
console.log("v3:", v3);

var v2 = 2;
var v3 = 3;

// var 변수는 재선언 가능하다.
var v3 = 5;
console.log("v2:", v2);
console.log("v3:", v3);

// let : 변수 선언과 할당을 분리할 수 있다.
let l1; // let l1 = 1; 같은말
console.log("l1:", l1);
l1 = 1;
console.log("l1:", l1);

// 선언하기 전에 참조할 수 없다.
// console.log("l2:", l2); // reference error
let l2 = 2;
console.log("l2:", l2);

// let 변수는 값을 재할당 할 수 있다.
l2 = 3;
console.log("l2:", l2);

// let 변수는 재선언 할 수 없다.
// let l2 = 3;
l2 = 4;
console.log("l2:", l2);

// const 변수는 선언과 동시에 할당을 해줘야 합니다.
// const c1; // error

// 선언하기 전에 참조할 수 없다.
// console.log(c1); // reference error

const c1 = 1;
console.log("c1:", c1);

// 값을 재할당 할 수 없다.
// c1 = 2; // type error

// 재선언 할 수 없다.
// const c1 = 2; // syntax error
