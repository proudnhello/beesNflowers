// sketch.js - Two modes: war and peace. Bees spawn from hives and either cooperate or fight through colors of flowers.
// Author: Moore Macauley, Jackie Ho, Lo Weislak
// Date:

// Globals
let canvasContainer;
var centerHorz, centerVert;
let flowers = [];
let bees = [];
let hives = [];
let war = false;
let newFlowerSpawnRadius = 75;
let newFlowerExclusionRadius = 25;
let BEE_SPEED = 0.005;
let nuclearButton = document.getElementById("nuclearButton");
let buttonContainer = document.getElementById("buttonContainer"); 
let EASsound = new Audio('./sound/alarm.mp3');

document.getElementById("war").addEventListener("click", enableWar);

document.getElementById("peace").addEventListener("click", enablePeace);

nuclearButton.addEventListener("click", enableWar);

function enableWar() {
  war = true;
  buttonContainer.style.display = "none";
  EASsound.currentTime = 0;
  EASsound.play();
}

function enablePeace() {
  war = false;
  buttonContainer.style.display = "block";
  buttonContainer.textAlign = "center";
  EASsound.pause();
}

//This class stores infomation about each flower displayed on the screen
//TODO: Don't spawn flowers directly on top of hives or each other
class Flower {
  constructor(x, y, stigmaColor, petalColor) {
    this.position = {x, y};
    this.stigmaColor = stigmaColor;
    this.petalColor = petalColor;
    this.visited = false;
    this.destroyed = false;
    this.targeted = false;
  }

  duplicate() {
    let dist = 0;
    let newFlowerX = 0;
    let newFlowerY = 0;
    // Range of xy values should be bewteen -newFlowerSpawnRadius and +newFlowerSpawnRadius of current xy position, and not within newFlowerExclusionRadius of current flower
    // Pick xy values until they are within the range and not within the exclusion radius

    //while(dist < newFlowerExclusionRadius && !(newFlowerX < 0 || newFlowerX > width || newFlowerY < 0 || newFlowerY > height)) {
    while(dist < newFlowerExclusionRadius || !(onCanvas(newFlowerX, newFlowerY))) {
      newFlowerX = this.position.x + Math.floor(Math.random() * (newFlowerSpawnRadius * 2) - newFlowerSpawnRadius);
      newFlowerY = this.position.y + Math.floor(Math.random() * (newFlowerSpawnRadius * 2) - newFlowerSpawnRadius);
      dist = Math.sqrt(Math.pow(this.position.x - newFlowerX, 2) + Math.pow(this.position.y - newFlowerY, 2));
    }

    console.log(`NEW ${this.petalColor} FLOWER AT: ${newFlowerX}, ${newFlowerY}`);
    let f = new Flower(newFlowerX, newFlowerY, this.stigmaColor, this.petalColor);
    f.visited = this.visited;
    flowers.push(f);
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
    ellipse(this.position.x-12,this.position.y-7,10,10) ;
  }

  destroy(){
    flowers.splice(flowers.indexOf(this), 1);
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
    this.oldTargetPosition = {x: this.beeSpawn.x, y: this.beeSpawn.y}
    this.distTraveled = 0;
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
      if(flower.target !== flower && flower.petalColor != this.color && flowerDist <= minDist && flower.targeted === false) {
        minDist = flowerDist;
        minFlower = flower;
      }
    }
    return minFlower;
  }

  // Find all flowers within search radius, then select one at random
  getRandomInRange() {
    let possibleTargets = [];
    for(let flower of flowers) {
      var flowerDist = dist(flower.position.x, flower.position.y, this.position.x, this.position.y);
      // If flower is within search radius and not the same color as the bee, add it to the list of possible targets
      if(
          flowerDist <= this.searchRadius &&
          flower.target !== flower && //Target is not current flower
          flower.targeted === false &&  //No other bee is targeting the flower
          dist(flower.position.x, flower.position.y, this.oldTargetPosition.x, this.oldTargetPosition.y) > newFlowerSpawnRadius
      ) {
        possibleTargets.push(flower);
      }
    }

    // If no flowers are in range, return the closest flower that is not the same color
    if(possibleTargets.length == 0) {
      possibleTargets.push(this.getClosest());
    }
    return possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
  }

  //TODO: Assign weights based on color of flower
  //FIX: Bees sometimes get stuck on flower for one cycle
  search() {
    var target = this.getRandomInRange();
    if(target == null) {
      this.target = null;
      return
    }
    target.targeted = true;
    this.oldTargetPosition = {x: this.position.x, y: this.position.y};
    this.setTarget(target);  
  }

  //If bee has a target flower, move towards it. If it doesn't, search for nearby flowers
  move() {
    if(this.target && !this.target.destroyed) {
      // If we have a target, move towards it
      this.distTraveled += BEE_SPEED;
      this.position.x = lerp(this.oldTargetPosition.x, this.target.position.x, this.distTraveled);
      this.position.y = lerp(this.oldTargetPosition.y, this.target.position.y, this.distTraveled);
      if(this.targetReached()) {
        // If the target has been reached, set the target to null and search for a new one
        this.target.targeted = false;
        this.distTraveled = 0;
        if (war) {
          this.moveBeeAtWar();
        } else {
          this.moveBeeAtPeace();
        }
        this.search();
      }
    } else {
      this.search();
    }
  }

  moveBeeAtWar() {
    // If it's a different color and has been visited, destroy it
    if (this.target.petalColor != this.color && this.target.visited == true) {
      this.target.destroyed = true;              
      this.target.destroy();
    } else {
      // Otherwise, mark it as visited and duplicate it if it has been visited
      if(this.target.visited == true){
        this.target.duplicate();
      }
      this.target.visited = true;
      this.target.petalColor = this.color;
    }
  }

  moveBeeAtPeace() {
    // If it's unvisited, mark it as visited and set the color to the bee's color
    if(this.target.visited == false){
      this.target.visited = true;
      this.target.petalColor = this.color;
    } else {
    // Otherwise, duplicate it, set the new flower's color to a mix of the bee's color and the flower's color
      this.target.duplicate();
      this.target.petalColor = lerpColor(color(this.color), color(this.target.petalColor), 0.5);
    }
  }

  //Helper function to check if target flower has been reached
  targetReached() {
    return this.distTraveled >= 1;
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

  colorMode(HSB, 1);

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
    for(var i = 0; i < 5; i++) {
      bees.push(new Bee(hive.color, hive.position));
    }
  }

  //Spawn 10 flowers at random locations to start
  for(let i = 0; i < 30; i++) {
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

function onCanvas(x, y) {
  if ((x > 0 && x < width) && (y > 0 && y < height)) {
    return true;
  }
  return false;
}