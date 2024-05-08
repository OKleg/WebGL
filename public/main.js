
// import { drawScene } from "./draw_scene.js";
// import { initBuffers } from "./init_buffer.js";
// 
const  SQUARE_COORDS =   [ 0.0, 1.0, 0,
                          2.0, 1.0, 0,
                          2.0, -1.0, 0,
                          0.0, 1.0, 0,
                          2.0, -1.0, 0,
                          0.0, -1.0, 0
                        ];
 const  TRIANGLE_COORDS = [ 0.0, 1.0, 0,
                            1.0, -1.0, 0,
                            -1.0, -1.0, 0
                          ];
//const  TRIANGLE_COORDS = [ -1.0, -2.0, 0.0, 0.0, 1.0, -2.0];

const CUBE_COORDS = [
  // Front face
  -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

  // Back face
  -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

  // Top face
  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

  // Right face
  1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

  // Left face
  -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
];



const COLORS_MULCOLTRIANGLE = [
  1.0,
  0.0,
  0.0,
  1.0, // red
  0.0,
  1.0,
  0.0,
  1.0, // green
  0.0,
  0.0,
  1.0,
  1.0, // blue
];
const RED = [
  1.0,
  0.0,
  0.0,
  1.0, // red
]
const SQUARE_COLOR_1 = [
  0.0,
  0.8,
  0.8,
  1.0, 
]
const faceColors = [
  [1.0, 1.0, 1.0, 1.0], // Front face: white
  [1.0, 0.0, 0.0, 1.0], // Back face: red
  [0.0, 1.0, 0.0, 1.0], // Top face: green
  [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
  [1.0, 1.0, 0.0, 1.0], // Right face: yellow
  [1.0, 0.0, 1.0, 1.0], // Left face: purple
];

// Convert the array of colors into a table for all the vertices.

var CUBE_COLORS = [];

for (var j = 0; j < faceColors.length; ++j) {
  const c = faceColors[j];
  // Repeat each color four times for the four vertices of the face
  CUBE_COLORS = CUBE_COLORS.concat(c, c, c, c);
}


// ------ Indices ---------------------------------///


  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const INDICES_CUBE = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ];

    /// ---------- VERTEX SHADERS ---------- ///
// Vertex shader program
const vsBase = `    
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    varying lowp vec4 vPosition;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vPosition = aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  const vsMulticolor = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;
  varying lowp vec4 vPosition;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
    vPosition = aVertexPosition;
  }
`;

  /// ---------- FRAGMENT SHADERS ---------- ///
  const fsBase = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `;
  const fsMulticolor = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
  const fsLine = `
   
    precision mediump float;
    varying lowp vec4 vPosition;
    
    void main() {
        float k = 10.0;
        int sum = int(vPosition.x * k) ;
        if ((sum - (sum / 2 * 2)) == 0) {
            gl_FragColor = vec4(0, 0.8, 0.8, 1);
        } else {
            gl_FragColor = vec4(1, 1, 1, 1);
        }
    }
`;
//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

    /// ----------  Init Buffer ---------- ///


function initBuffers(gl, coords , colors, indices) {
  const positionBuffer = initPositionBuffer(gl, coords);
  if (colors.length == 4){
    for (let i = 0; i < coords.length/2; i++) {
      colors = colors.concat(colors);
    }
    
  }
  const colorBuffer = initColorBuffer(gl, colors);

  const indexBuffer = initIndexBuffer(gl, indices);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

function initPositionBuffer(gl, coords) {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  const positions = coords;

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function initColorBuffer(gl, colors) {

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}
//INDICES_CUBE
function initIndexBuffer(gl,indices) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

  // Now send the element array to GL

  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );

  return indexBuffer;
}

/// ---------- Draw Scene ---------- ///

function drawScene(gl, programInfo, buffers, vertex_count, mode = "TRIANGLES") {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = (45 * Math.PI) / 180; // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0],
  ); // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute(gl, buffers, programInfo);
  setColorAttribute(gl, buffers, programInfo);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  {
    const offset = 0;
    const vertexCount = vertex_count;
    switch (mode) {
      case "TRIANGLES": gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
      break;
      case "TRIANGLE_FAN" : gl.drawArrays(gl.TRIANGLE_FAN, offset, vertexCount); break;
      case "TRIANGLE_STRIP": gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount); break;
      default: gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
        break;
    }
  }
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 3; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(gl, buffers, programInfo) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

console.log("WebGL before main")
main();
console.log("WebGL after main")
//
//  ------------------ START HERE MAIN FUNCTIONS -------- BEGIN ---------------------------- //

/// DRAW ///
//
function draw(vs, fs, coords, colors, canvas_name, indices , mode = "TRIANGLES") {
  const this_canvas = document.querySelector(canvas_name);
  // Initialize the GL context
  const gl = this_canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // +++++++++++++++++++++ SHADERS +++++++++++++++++++++ //
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vs, fs);  
  
  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };
  // +++++++++++++++++++++   BUFFER +++++++++++++++++++++ //
  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl,coords,colors, indices);
  
  // Draw the scene
  drawScene(gl, programInfo, buffers, coords.length/2, mode);
  
}
////        TRIANGLE END      ////

function polygon_coord(verticesNumber, radius){
  var coordinates = new Float32Array(3.0 * verticesNumber);
  var rotationAngle = (2.0 * Math.PI / verticesNumber).toFloat;
  var startAngle = (- Math.PI / 2.0).toFloat;
  for (let idx = 0; idx < verticesNumber.length; idx++) {
      var currentAngle = startAngle + idx * rotationAngle;
      coordinates[idx * 3] = radius * Math.cos(currentAngle);
      coordinates[idx * 3 + 1] = radius * Math.sin(currentAngle);
      coordinates[idx * 3 + 2] = 0;
  }
  return coordinates
}

function main() {
    // Lab 1
    draw(vsBase, fsBase , SQUARE_COORDS, SQUARE_COLOR_1,"#glcanvas1")
    draw(vsMulticolor, fsMulticolor , TRIANGLE_COORDS, COLORS_MULCOLTRIANGLE,"#glcanvas2")
    // Lab 2
    draw(vsBase, fsBase , polygon_coord(5,1), RED,"#glcanvas3",mode = "TRIANGLE_FAN")
    draw(vsMulticolor, fsMulticolor , TRIANGLE_COORDS, COLORS_MULCOLTRIANGLE,"#glcanvas4")
    draw(vsBase, fsLine , SQUARE_COORDS, SQUARE_COLOR_1,"#glcanvas5")
}




