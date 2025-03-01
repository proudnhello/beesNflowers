// sketch.js - purpose and description here
// Author: Moore Macauley, Jackie Ho, Lo Weislak
// Date:

// Globals
let canvasContainer;
var centerHorz, centerVert;
let flowers = [];
let bees = [];
let hives = [];

//This class stores infomation about each flower displayed on the screen
//TODO: Don't spawn flowers directly on top of eachother or hives
class Flower {
  constructor(x, y, stigmaColor, petalColor){
    this.x = x;
    this.y = y; 
    this.stigmaColor = stigmaColor;
    this.petalColor = petalColor;
  }

  //Flower shape from https://editor.p5js.org/katiejliu/sketches/Je9G3c5z9
  sprite() {
    noStroke();
    fill(this.petalColor);
    ellipse(this.x,this.y,20,20);
    ellipse(this.x-15,this.y+5,20,20);
    ellipse(this.x-25,this.y-5,20,20);
    ellipse(this.x-17,this.y-20,20,20);
    ellipse(this.x,this.y-15,20,20);
    fill(this.stigmaColor);
    ellipse(this.x-12,this.y-7,22,22) ;
  }
}

//This class stores information about each of the three hives
class Hive {
  constructor(hiveColor, position) {
    this.color = hiveColor;
    this.position = {x: position.x, y: position.y};
    this.image = loadImage(`./images/${hiveColor}Hive.png`);
    this.beeSpawn = {x: position.x + 45, y: position.y + 55}; //Calculate center of the image
  }

  display() {
    image(this.image, this.position.x, this.position.y);
  }
}

//This class stores information about each bee
class Bee extends Hive {
  constructor(color, position) {
    super(color, position); //Call parent hive class
    this.target = null;
    this.searchRadius = 100;
    this.position = this.beeSpawn;
  }

  display() {
    push();
    fill("black");
    ellipse(this.position.x, this.position.y, 11, 11);
    fill(this.color);
    ellipse(this.position.x, this.position.y, 10, 10);
    pop();
  }

  getNeighbors() {

  }

  search() {

  }

  move() {

  }

  setTarget() {

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

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  //Add the three hives
  hives.push(new Hive("red", {x: 70, y: 50}));
  hives.push(new Hive("green", {x: width - 170, y: 50}));
  hives.push(new Hive("blue", {x: width/2 - 50, y: height - 170}));
  
  //Add bees in hives
  for(let hive of hives) {
    bees.push(new Bee(hive.color, hive.position));
  }

  //Spawn 10 flowers at random locations to start
  for(let i = 0; i < 10; i++) {
    flowers.push(new Flower(random() * width, random() * height, "yellow", "grey"));
  }
}

function draw() {
  background("#105708"); //Green background

  for(let flower of flowers) {
    flower.sprite();
  }

  for(let hive of hives) {
    hive.display();
  }

  for(let bee of bees) {
    bee.display();
  }
}

function mouseClicked() {
  flowers.push(new Flower(mouseX, mouseY, "yellow", "grey"));
}