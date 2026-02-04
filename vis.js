//container
let svg2 = document.querySelector(".a2-svg-art");
console.log(svg2);

//create element
const svgNS = "http://www.w3.org/2000/svg";

const path = document.createElementNS(svgNS, "path");

path.setAttribute(
  "d",
  "M 40,0 C -20,70 0,100 47,95 L 300,0 L 60,50 C 42,53 25,40 40,0",
);
path.setAttribute("fill", "red");

svg2.appendChild(path);
