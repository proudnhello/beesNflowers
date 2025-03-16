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
let siren = new Audio('./sound/siren.mp3');
let buzz = new Audio('./sound/bee.mp3');
let garden = new Audio('./sound/garden.mp3');

let explosion = new Audio('./sound/explosion.mp3');
let gun = new Audio('./sound/gun.mp3');
let plane = new Audio('./sound/plane.mp3');
let cry = new Audio('./sound/cry.mp3');

let warSounds = [explosion, gun, plane, cry];
let soundEffectCountdown = 0;

let conflictSketch = function(p){
  p.setup = function() {
    p.colorMode(p.HSB, 1);
    // place our canvas, making it fit our container
    canvasContainer = $("#canvas-container");
    let conflictCanvas = p.createCanvas(canvasContainer.width(), canvasContainer.height());
    conflictCanvas.parent("canvas-container");
      
    $(window).resize(function() {
      resizeScreen(p);
    });
    resizeScreen(p);
  
    //Add the three hives
    hives.push(new Hive("red", {x: 70, y: 50}, p));
    hives.push(new Hive("green", {x: p.width - 170, y: 50}, p));
    hives.push(new Hive("blue", {x: p.width/2 - 50, y: p.height - 170}, p));
    
    //Add bees in hives
    for(let hive of hives) {
      for(var i = 0; i < 5; i++) {
        bees.push(new Bee(hive.color, hive.position, p));
      }
    }
  
    //Spawn 10 flowers at random locations to start
    for(let i = 0; i < 30; i++) {
      flowers.push(new Flower(p.random() * p.width, p.random() * p.height, "yellow", "grey", p));
    }
  }
  
  p.draw = function() {
    p.background("#105708"); //Green background
  
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
    soundEffectCountdown += BEE_SPEED;
  }

  p.mouseClicked = function() {
    if(canvasClicked(p)) {
      flowers.push(new Flower(p.mouseX, p.mouseY, "yellow", "grey", p));
    }
    if(war){
      if(siren.paused) {
        siren.play();
      }
    }else if(!war){
      if(garden.paused) {
        garden.play();
      }
    }
  }
}

let peaceSketch = function(p) {
  let container;
  p.setup = function() {
    p.colorMode(p.HSB, 1);
    // place our canvas, making it fit our container
    canvasContainer = $("#minigame-container");
    let conflictCanvas = p.createCanvas(canvasContainer.width(), canvasContainer.height());
    conflictCanvas.parent("minigame-container");
    container = $("#minigame-container");
      
    $(window).resize(function() {
      resizeScreen(p);
    });
    resizeScreen(p);
    this.testHive = new Hive("blue", {x: p.width/2 - 50, y: p.height/2 - 50}, p);
    p.hide();
  }

  p.draw = function() {
    p.background("green");
    this.testHive.display();
  }

  p.mousePressed = function() {
    if(canvasClicked(p)) {
      enablePeace();
    }
  }

  p.hide = function() {
    container.hide();
  }
  p.show = function() {
    container.show();
  }
}

let p5Conflict = new p5(conflictSketch)
let p5Peace = new p5(peaceSketch)

document.getElementById("war").addEventListener("click", enableWar);

document.getElementById("peace").addEventListener("click", enablePeace);

nuclearButton.addEventListener("click", enableWar);

function enableWar() {
  war = true;
  buttonContainer.style.display = "none";
  garden.pause();
  siren.currentTime = 0;
  siren.volume = 0.5;
  siren.play();
  p5Peace.show();
}

function enablePeace() {
  war = false;
  buttonContainer.style.display = "block";
  buttonContainer.textAlign = "center";
  siren.pause();
  garden.currentTime = 0;
  garden.volume = 0.5;
  garden.play();
  p5Peace.hide();
}

//This class stores infomation about each flower displayed on the screen
//TODO: Don't spawn flowers directly on top of hives or each other
class Flower {
  constructor(x, y, stigmaColor, petalColor, p) {
    this.position = {x, y};
    this.stigmaColor = stigmaColor;
    this.petalColor = petalColor;
    this.visited = false;
    this.destroyed = false;
    this.targeted = false;
    this.p = p;
  }

  duplicate() {
    let dist = 0;
    let newFlowerX = 0;
    let newFlowerY = 0;
    // Range of xy values should be bewteen -newFlowerSpawnRadius and +newFlowerSpawnRadius of current xy position, and not within newFlowerExclusionRadius of current flower
    // Pick xy values until they are within the range and not within the exclusion radius

    //while(dist < newFlowerExclusionRadius && !(newFlowerX < 0 || newFlowerX > width || newFlowerY < 0 || newFlowerY > height)) {
    while(dist < newFlowerExclusionRadius || !(onCanvas(newFlowerX, newFlowerY, this.p))) {
      newFlowerX = this.position.x + Math.floor(Math.random() * (newFlowerSpawnRadius * 2) - newFlowerSpawnRadius);
      newFlowerY = this.position.y + Math.floor(Math.random() * (newFlowerSpawnRadius * 2) - newFlowerSpawnRadius);
      dist = Math.sqrt(Math.pow(this.position.x - newFlowerX, 2) + Math.pow(this.position.y - newFlowerY, 2));
    }

    let f = new Flower(newFlowerX, newFlowerY, this.stigmaColor, this.petalColor, this.p);
    f.visited = this.visited;
    flowers.push(f);
  }

  //Flower shape from https://editor.p5js.org/katiejliu/sketches/Je9G3c5z9
  sprite() {
    this.p.noStroke();
    this.p.fill(this.petalColor);
    this.p.ellipse(this.position.x,this.position.y,20,20);
    this.p.ellipse(this.position.x-15,this.position.y+5,20,20);
    this.p.ellipse(this.position.x-25,this.position.y-5,20,20);
    this.p.ellipse(this.position.x-17,this.position.y-20,20,20);
    this.p.ellipse(this.position.x,this.position.y-15,20,20);
    this.p.fill(this.stigmaColor);
    this.p.ellipse(this.position.x-12,this.position.y-7,10,10) ;
  }

  destroy(){
    flowers.splice(flowers.indexOf(this), 1);
  }
}

//This class stores information about each of the three hives
class Hive {
  constructor(hiveColor, position, p) {
    this.color = hiveColor;
    this.position = {x: position.x, y: position.y};
    this.image = p.loadImage(`./images/${hiveColor}Hive.png`);
    this.beeSpawn = {x: position.x + 45, y: position.y + 80}; //Calculate center of the image
    this.p = p;
  }

  display() {
    this.image.resize(90, 0);
    this.p.image(this.image, this.position.x, this.position.y);
  }
}

//This class stores information about each bee
class Bee extends Hive {
  constructor(color, position, p) {
    super(color, position, p); //Call parent hive class
    this.target = null;
    this.searchRadius = 300;
    this.position = {x: this.beeSpawn.x, y: this.beeSpawn.y}; //Set start position to middle of hive
    this.oldTargetPosition = {x: this.beeSpawn.x, y: this.beeSpawn.y}
    this.distTraveled = 0;
    this.p = p;
  }

  display() {
    this.p.push();
    this.p.fill("black");
    this.p.ellipse(this.position.x, this.position.y, 11, 11);
    this.p.fill(this.color);
    this.p.ellipse(this.position.x, this.position.y, 10, 10);
    this.p.pop();
  }

  //Returns closest flower that is not the same color
  getClosest() {
    var minDist = canvasContainer.width(); //Assign large value
    var minFlower = null;
    for(let flower of flowers) {
      var flowerDist = this.p.dist(flower.position.x, flower.position.y, this.position.x, this.position.y);
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
      var flowerDist = this.p.dist(flower.position.x, flower.position.y, this.position.x, this.position.y);
      // If flower is within search radius and not the same color as the bee, add it to the list of possible targets
      if(
          flowerDist <= this.searchRadius &&
          flower.target !== flower && //Target is not current flower
          flower.targeted === false &&  //No other bee is targeting the flower
          this.p.dist(flower.position.x, flower.position.y, this.oldTargetPosition.x, this.oldTargetPosition.y) > newFlowerSpawnRadius
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
      this.position.x = this.p.lerp(this.oldTargetPosition.x, this.target.position.x, this.distTraveled);
      this.position.y = this.p.lerp(this.oldTargetPosition.y, this.target.position.y, this.distTraveled);
      if(this.targetReached()) {
        // If the target has been reached, set the target to null and search for a new one
        if(soundEffectCountdown >= 1){
          soundEffectCountdown = 0;
          if(!war){
            buzz.play();
          }else{
            warSounds[Math.floor(Math.random() * warSounds.length)].play();
          }
        }
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
      this.target.petalColor = this.p.lerpColor(this.p.color(this.color), this.p.color(this.target.petalColor), 0.5);
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

function resizeScreen(p) {
  centerHorz = canvasContainer.width() / 2; // Adjusted for drawing logic
  centerVert = canvasContainer.height() / 2; // Adjusted for drawing logic
  console.log("Resizing...");
  p.resizeCanvas(canvasContainer.width(), canvasContainer.height());
  // redrawCanvas(); // Redraw everything based on new size
}

//Helper function to determine if mouse was clicked on the canvas
function canvasClicked(p) {
	if((p.mouseX > 0 && p.mouseX < p.width) && (p.mouseY > 0 && p.mouseY < p.height)) {
		return true;
	}
	return false;
}

function onCanvas(x, y, p) {
  if ((x > 0 && x < p.width) && (y > 0 && y < p.height)) {
    return true;
  }
  return false;
}