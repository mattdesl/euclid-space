const socket = io();

let shapes = [];

function setup () {
  createCanvas(windowWidth, windowHeight);

  // Received a new shape list from the server
  socket.on('shapes', updateShapes);
}

function updateShapes (newShapes) {
  console.log(newShapes);
  shapes = newShapes;
}

function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
}

function draw () {
  background('#fff2d5');
  strokeWeight(1);
  
  for (let i = 0; i < shapes.length; i++) {
    // disable both fill and stroke
    noStroke();
    noFill();

    // current shape
    const shape = shapes[i];
    
    // get color and set it
    const color = shape.color;
    
    // user can be filled or stroked
    if (shape.fill) fill(color);
    else stroke(color);
    
    const minDim = min(width, height);
    const x = shape.x * width;
    const y = shape.y * height;
    const size = minDim * 0.05;

    const rotation = shape.rotation;
    
    drawShape(shape.type, x, y, size, rotation);
  }
}

function mousePressed () {
  // provide the mouseX and mouseY positions between 0..1
  socket.emit('add', {
    x: mouseX / width,
    y: mouseY / height
  });
}

function drawShape (type, x, y, size, rotation = 0) {
  push();

  translate(x, y);
  rotate(rotation);
  translate(-x, -y);

  // draw shapes
  if (type === 'circle') {
    circle(x, y, size);
  } else if (type === 'rect') {
    rectMode(CENTER);
    rect(x, y, size, size);
  } else if (type === 'triangle') {
    const halfSize = size / 2;
    triangle(
      x - halfSize, y - halfSize,
      x + halfSize, y + halfSize,
      x - halfSize, y + halfSize
    );
  } else if (type === 'arc') {
    arc(x, y, size, size, 0, PI / 2, PIE);
  } else if (type === 'semicircle') {
    arc(x, y, size, size, 0, PI, PIE);
  }

  pop();
}