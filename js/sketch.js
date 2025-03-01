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
//TODO: Don't spawn flowers directly on top of hives or each other
class Flower {
  constructor(x, y, stigmaColor, petalColor) {
    this.position = {x, y};
    this.stigmaColor = stigmaColor;
    this.petalColor = petalColor;
  }

  //Flower shape from https://editor.p5js.org/katiejliu/sketches/Je9G3c5z9
  sprite() {
    noStroke();
    fill(this.petalColor);
    ellipse(this.position.x,this.position.y,20,20);
    ellipse(this.position.x-15,this.position.y+5,20,20);
    ellipse(this.position.x-25,this.position.y-5,20,20);
    ellipse(this.position.x-17,this.position.y-20,20,20);
    ellipse(this.position.x,this.position.y-15,20,20);
    fill(this.stigmaColor);
    ellipse(this.position.x-12,this.position.y-7,22,22) ;
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
    this.searchRadius = 300;
    this.position = {x: this.beeSpawn.x, y: this.beeSpawn.y}; //Set start position to middle of hive
  }

  display() {
    push();
    fill("black");
    ellipse(this.position.x, this.position.y, 11, 11);
    fill(this.color);
    ellipse(this.position.x, this.position.y, 10, 10);
    pop();
  }

  //Returns closest flower that is not the same color
  getClosest() {
    var minDist = width; //Assign large value
    var minFlower = null;
    for(let flower of flowers) {
      var flowerDist = dist(flower.position.x, flower.position.y, this.position.x, this.position.y);
      if(flowerDist <= this.searchRadius && flower.petalColor != this.color && flowerDist <= minDist) {
        minDist = flowerDist;
        minFlower = flower;
      }
    }
    return minFlower;
  }

  //TODO: Assign weights based on color of flower
  //TODO: Move bee in random direction if no flower is in radius
  search() {
    this.setTarget(this.getClosest());  
  }

  //If bee has a target flower, move towards it. If it doesn't, search for nearby flowers
  move() {
    if(this.target) {
      this.position.x = lerp(this.position.x, this.target.position.x, 0.01);
      this.position.y = lerp(this.position.y, this.target.position.y, 0.01);
      if(this.targetReached()) {
        this.target.petalColor = this.color;
        this.target = null;
      }
    } else {
      this.search();
    }
  }

  //Helper function to check if target flower has been reached
  targetReached() {
    if(dist(this.position.x, this.position.y, this.target.position.x, this.target.position.y) <= 5) {
      return true;
    }
    return false;
  }

  setTarget(target) {
    this.target = target;
  }
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

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
    bee.move();
  }
}

function mouseClicked() {
  if(canvasClicked()) {
    flowers.push(new Flower(mouseX, mouseY, "yellow", "grey"));
  }
}

//Helper function to determine if mouse was clicked on the canvas
function canvasClicked() {
	if((mouseX > 0 && mouseX < width) && (mouseY > 0 && mouseY < height)) {
		return true;
	}
	return false;
}