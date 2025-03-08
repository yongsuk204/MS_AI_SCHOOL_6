const arr = ["red", "orange", "yellow"];

console.log(typeof arr);
console.log(arr.length);
console.log(arr[0]);
console.log(arr[100]);
console.log(arr[-1]);

// 요소추가
arr[3] = "blue";
console.log(arr);
arr[6] = "purple";
console.log(arr);

// 요소수정
arr[3] = "green";
console.log(arr);

// 요소삭제
delete arr[6];
console.log(arr);

// 슬라이스
const arr2 = arr.slice(0, 4);
console.log(arr2);

//forEach
const arr5 = [1, 2, 3];
arr5.forEach((item, idx, arr) => {
  console.log(item, idx, arr);
});

//map
const arr6 = [1, 2, 3, 4, 5];
const arr7 = arr6.map((item) => item * 100);
console.log(arr7);

//filter
const arr8 = [1, 2, 3, 4, 5, 6, 7, 8];
const arr9 = arr8.filter((item) => item % 2 == 0);
console.log(arr9);
