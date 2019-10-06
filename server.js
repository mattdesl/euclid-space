const express = require('express');

// create an express app
const app = express();

// create a server
const server = require('http').createServer(app);

// attach socket.io to the server
const io = require('socket.io').listen(server);

const port = process.env.PORT || 3000;

// Serve the current directory as a static website
// This allows us to use HTML, JavaScript, etc
app.use(express.static(__dirname));

// Start listening on port 3000
server.listen(port, () => {
  // Print to console just so we know its ready to go...
  console.log(`Server listening on http://localhost:${port}/`);
});

// ----------------------------------
// Below we setup our networking code
// ----------------------------------

// each user is assigned a random colour
const colors = [ '#0a0607', '#ffbe00', '#006697', '#fa0001' ];
const types = [ 'circle', 'semicircle', 'arc', 'rect', 'triangle' ];
const rotations = [ 0, Math.PI / 2, Math.PI, Math.PI * 1.5, Math.PI * 2 ];

// The list of all shapes contained in our app
let shapes = [];

// Create a socket.io connection
io.on('connection', socket => {
  // For the user, select some random properties
  const color = colors[Math.floor(Math.random() * colors.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const fill = Math.random() > 0.5;
  const rotation = rotations[Math.floor(Math.random() * rotations.length)];

  // When the user first connects we will show them everything on screen
  socket.emit('shapes', shapes);

  // When the user adds a shape, add it to a list
  socket.on('add', position => {
    // Make a new shape object
    const shape = {
      time: Date.now(), // time stamp of event
      color,
      fill,
      type,
      rotation,
      x: position.x,
      y: position.y
    };

    // Push the shape into our list of all shapes
    shapes.push(shape);

    // Now we tell ALL users that the shapes have updated
    io.emit('shapes', shapes);
  });
});

// Last thing we need to do is make sure we clean up shapes
// Otherwise our page will just clutter forever !!
setInterval(() => {
  // 1 minute on screen
  const MAX_SHAPE_TIME = 30000;
  const now = Date.now();
  const newShapes = [];
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    if ((now - shape.time) < MAX_SHAPE_TIME) {
      newShapes.push(shape);
    }
  }
  shapes = newShapes;
  io.emit('shapes', shapes);
}, 5000);
