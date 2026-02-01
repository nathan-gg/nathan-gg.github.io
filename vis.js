let titles = document.querySelectorAll(".titles");
console.log(titles);

// titles.forEach((title) => {
//   title.style.color = "blue";
// });

// titles.forEach((title) => {
//   title.addEventListener("click", () => {
//     alert("hello");
//   });
// });

titles.forEach((title) => {
  title.addEventListener("click", () => {
    title.style.color = "blue";
  });
});

//container
let svg = document.querySelector("svg");
console.log(svg);

//create element
const svgNS = "http://www.w3.org/2000/svg";
const rect = document.createElementNS(svgNS, "rect");

//add that element into the container
rect.setAttribute("x", 100);
rect.setAttribute("y", 100);
rect.setAttribute("width", 100);
rect.setAttribute("height", 100);
rect.setAttribute("fill", "blue");

svg.appendChild(rect);
