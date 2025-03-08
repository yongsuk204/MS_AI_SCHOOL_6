let user = {
  userName: "홍길동",
  userAge: 20,
  nextAge: function () {
    this.userAge++; //this 는 자기객체에서 라는 뜻
  },
};

console.log(user);
console.log(user["userName"]);
console.log(user.userName);
user.userName = "김영희";
console.log(user.userName);
//메소드 호출하여 속성변경
console.log(user.nextAge()); // 리턴을 설정 안했기 때문에 undefined 뜸
console.log(user);
// 객체의 프로퍼티 추가/수정
user.heigth = 170.5;
console.log(user);

user.heigth = 178.5;
console.log(user);

// 프로퍼티 삭제
delete user.heigth;
console.log(user);
