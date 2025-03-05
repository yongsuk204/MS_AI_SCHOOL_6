let temperature = 10;

// if (temperature >= 30) {
//   console.log("집");
// } else if (temperature >= 20) {
//   console.log("공원");
// } else if (temperature >= 10) {
//   console.log("카페");
// } else {
//   console.log("영화관");
// }

let place =
  temperature >= 30
    ? "집"
    : temperature >= 20
    ? "공원"
    : temperature >= 10
    ? "카페"
    : "영화관";

console.log(place);

let score = 45;
if (score >= 60) {
  console.log("합격입니다.");
} else {
  console.log("불합격입니다.");
}
