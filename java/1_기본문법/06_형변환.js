let x;
x = String(1);
console.log(x, typeof x);
console.log(typeof 1.5);
console.log(typeof (1.5).toString()); //toString 메소드

let p = "1.5";
console.log(typeof p, typeof Number(p), Number(p));
console.log(parseInt(p), typeof parseInt(p));
console.log(parseFloat(p), typeof parseFloat(p));

let a = Boolean(undefined);
console.log(a, typeof a);

// 암묵적 형변환
console.log("==================================");
console.log("10" + 5);
console.log("10" + undefined);
console.log("10" + null);
console.log("10" + true);

// 숫자로 처리하려면 명시적으로 형변환을 해주어야 함
console.log("==================================");
console.log(parseInt("10") + 5);

//이외의 산술 연산자를 문자열과 함께 사용할 때 --> 숫자 타입으로 변환
console.log("==================================");
console.log("10" * 5); //50
console.log("10" * "5"); //50
console.log("10" * undefined); // NaN
console.log("10" * "a"); // NaN
console.log("a" * "a"); // NaN
console.log("10" * null); // 0
console.log("10" * true); // 10
console.log("10" * false); // 0
