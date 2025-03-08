console.log(Math.abs(-213));
console.log(Math.pow(2, 6));
console.log(Math.sqrt(16));
console.log(Math.ceil(6.4));
console.log(Math.ceil(4.7));
console.log(Math.floor(6.4));
console.log(Math.floor(4.7));
console.log(Math.round(4.7));
console.log(Math.round(6.3));
console.log(Math.max(1, 2, 3, 4, 5, 6, 7));
console.log(Math.min(1, 2, 3, 4, 5, 6, 7));
console.log(Math.random());
console.log(Math.PI);

//주사위
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

console.log(rollDice()); // 1~6 랜덤 출력
console.log(rollDice()); // 1~6 랜덤 출력
console.log(rollDice()); // 1~6 랜덤 출력
