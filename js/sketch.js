// sketch.js - purpose and description here
// Author: Your Name
// Date:

// Here is how you might set up an OOP p5.js project
// Note that p5.js looks for a file called sketch.js

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file
const VALUE1 = 1;
const VALUE2 = 2;

// Globals
let myInstance;
let canvasContainer;
var centerHorz, centerVert;
let points = [];

class MyClass {
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    myMethod() {
        // code to run when method is called
    }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

// setup() function is called once when the program starts
function setup() {
  // place our canvas, making it fit our container
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  // resize canvas is the page is resized

  // create an instance of the class
  myInstance = new MyClass("VALUE1", "VALUE2");

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();
}

// draw() function is called repeatedly, it's the main animation loop
function draw() {
  background(220);    
  points.forEach(point => {
    const newFlower = new Flower(point.mouseX, point.mouseY, color(238, 248, 86), color(244, 86, 248));
    newFlower.sprite();
  })
}

function mouseClicked() {
  points.push({mouseX, mouseY});
}

class Flower{
  constructor(x, y, stigma, petal){
    this.x = x;
    this.y = y; 
    this.stigma = stigma;
    this.petal = petal;
  }
  //Flower shape from https://editor.p5js.org/katiejliu/sketches/Je9G3c5z9
  sprite(){
    noStroke();
    fill(this.petal);
    ellipse(this.x,this.y,20,20)
    ellipse(this.x-15,this.y+5,20,20)
    ellipse(this.x-25,this.y-5,20,20)
    ellipse(this.x-17,this.y-20,20,20)
    ellipse(this.x,this.y-15,20,20)
    fill(this.stigma);
    ellipse(this.x-12,this.y-7,22,22) 
  }
}