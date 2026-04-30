//
//
var canvas_width = 400;
var canvas_height = 400;
const buffer = 10;
let move_hist = [];
let sizeX = 50;
let sizeY = 50;
let s = 2;
let data = {};
let count = 0;
let bot = {
  px: 0,
  py: 0,
  angle: 0,
  last_angle: 0,
};

let valid_moves = [];

function reset_values() {
  
move_hist = [];
sizeX = 50;
sizeY = 50;
s = 2;
data = {};
count = 0;
bot = {
  px: 0,
  py: 0,
  angle: 0,
  last_angle: 0,
};

valid_moves = [];
}

function setup() {
  noLoop()
  createCanvas(canvas_width, canvas_height);
  ui_sizeX = createInput("45");
  ui_sizeX.position(0, 0);
  ui_sizeX.size(100, 15);
  ui_sizeY = createInput("97");
  ui_sizeY.position(0, 20);
  ui_sizeY.size(100, 15);
  ui_generate = createButton("Generate");
  ui_generate.position(0, 40);
  ui_generate.size(100, 25);
  ui_generate.mousePressed(generate);
  generate()
}

function alert() {
  background(220)
  textSize(40)
  textAlign(CENTER, CENTER)
  text("Generating...", width/2, height/2)
  text("This may take a while", width/2, height/2+50)
  redraw()
}

function generate() {
  alert()
  reset_values()
  push();

  background(220);
  translate(buffer, buffer);
  sizeX = float(ui_sizeX.value());
  sizeY = float(ui_sizeY.value());
  s = (min(width, height) - buffer) / max(sizeX, sizeY);
  console.time("generation time");
  move_hist.push({
    px: bot.px,
    py: bot.py,
  });
  data[getID(bot.px, bot.py)] = "";

  //noprotect
  for (let ii = 0; ii < 9999999; ii++) {
    run();
    count++;
    if (move_hist.length == 1 && ii > 1) {
      console.log(ii);
      clean();
      break;
    }
  }
  console.timeEnd("generation time");
  console.log("render time:", millis());
  console.log(count);
  pop();
}

function draw() {
  alert()
}

function get_valid_moves() {
  let px = bot.px;
  let py = bot.py;
  valid_moves = [];

  if (inMaze(px, py - 1) && data[getID(px, py - 1)] == undefined) {
    valid_moves.push(0);
  }
  if (inMaze(px + 1, py) && data[getID(px + 1, py)] == undefined) {
    valid_moves.push(1);
  }
  if (inMaze(px, py + 1) && data[getID(px, py + 1)] == undefined) {
    valid_moves.push(2);
  }
  if (inMaze(px - 1, py) && data[getID(px - 1, py)] == undefined) {
    valid_moves.push(3);
  }
}

function getID(x, y) {
  return str(x) + ":" + str(y);
}

function inMaze(x, y) {
  if (x >= 0 && x < sizeX && y >= 0 && y < sizeY) {
    return true;
  }
  return false;
}

function run() {
  let px2 = bot.px;
  let py2 = bot.py;
  if (!isStuck()) {
    get_valid_moves();
    pickDirection();
    move();
  } else if (true && move_hist.length > 1) {
    move_hist.splice(move_hist.length - 1, 1);
    bot.px = move_hist[move_hist.length - 1].px;
    bot.py = move_hist[move_hist.length - 1].py;
  }
  stroke(0);
  strokeWeight((s / 3) * 2);
  line(bot.px * s, bot.py * s, px2 * s, py2 * s);
}

function move() {
  if (bot.angle == 0) {
    bot.py -= 1;
  }
  if (bot.angle == 1) {
    bot.px += 1;
  }
  if (bot.angle == 2) {
    bot.py += 1;
  }
  if (bot.angle == 3) {
    bot.px -= 1;
  }
  data[getID(bot.px, bot.py)] = "";
  move_hist.push({
    px: bot.px,
    py: bot.py,
  });
}

function pickDirection() {
  bot.angle = valid_moves[floor(random(0, valid_moves.length))];
}

function isStuck() {
  let px = bot.px;
  let py = bot.py;

  if (inMaze(px, py - 1) && data[getID(px, py - 1)] == undefined) {
    return false;
  }
  if (inMaze(px + 1, py) && data[getID(px + 1, py)] == undefined) {
    return false;
  }
  if (inMaze(px, py + 1) && data[getID(px, py + 1)] == undefined) {
    return false;
  }
  if (inMaze(px - 1, py) && data[getID(px - 1, py)] == undefined) {
    return false;
  }

  return true;
}

function clean() {
  let s2 = (s / 3) * 2;
  fill(0);
  noStroke();
  for (let y = 0; y < sizeY; y++) {
    for (let x = 0; x < sizeX; x++) {
      square(x * s - s / 2 + s2 / 4, y * s - s / 2 + s2 / 4, s2);
    }
  }
}

function buildGrid() {
  let grid = [];
  for (let y = 0; y < sizeY; y++) {
    let row = [];
    for (let x = 0; x < sizeX; x++) {
      row.push(data[getID(x, y)] ? 1 : 0);
    }
    grid.push(row);
  }
  return grid;
}

function export_maze() {
  let export_data = {
    width: sizeX,
    height: sizeY,
    grid: buildGrid(),
  };

  saveJSON(export_data, "maze.json");
}
