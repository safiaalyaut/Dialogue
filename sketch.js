let nodes = [];
let mainNodes = {}; // Object to store fixed main nodes for each section

function setup() {
  let cnv = createCanvas(windowWidth, document.body.scrollHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '-1');
  textAlign(CENTER, CENTER);
  textSize(14);

  createMainNodes(); // Create the main diamonds
}

function draw() {
  clear();

  // Draw lines first
  for (let node of nodes) {
    let main = mainNodes[node.section];
    stroke(150);
    line(main.x, main.y, node.x, node.y);
  }

  // Draw all main and regular nodes
  for (let key in mainNodes) {
    mainNodes[key].display();
  }
  for (let node of nodes) {
    node.display();
    node.dragged();
  }
}

function mousePressed() {
  for (let node of nodes) {
    node.pressed();
  }
}

function mouseReleased() {
  for (let node of nodes) {
    node.released();
  }
}

function addNode(sectionId) {
  const section = document.getElementById(sectionId);
  const input = section.querySelector('input');
  const value = input.value.trim();
  if (value === '') return;

  const baseNode = mainNodes[sectionId];
  const x = baseNode.x + random(-100, 100);
  const y = baseNode.y + random(100, 150);

  let newNode = new Node(x, y, value, false);
  newNode.section = sectionId;
  nodes.push(newNode);
  input.value = '';
}
function createMainNodes() {
  const sectionTitles = {
    section1: "You're On a Bus",
    section2: "You're At school",
    section3: "You're At a Funeral",
  };

  ['section1', 'section2', 'section3'].forEach(sectionId => {
    const section = document.getElementById(sectionId);
    const rect = section.getBoundingClientRect();
    const x = windowWidth / 2;
    const y = rect.top + rect.height / 2;
    rect.height= 300;

    // Assign a unique title for each section
    const label = sectionTitles[sectionId] || `Main ${sectionId}`;
    let mainNode = new Node(x, y, label, true);
    mainNodes[sectionId] = mainNode;
  });
}

class Node {
  constructor(x, y, label, fixed = false) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.fixed = fixed;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.padding = 20;
    this.maxWidth = 200;  // Maximum width before wrapping
  }

  display() {
    textSize(30);
    textFont('Playwrite');
    fill(0);
    textAlign(CENTER, CENTER);

    // Calculate text width and height based on the label
    let lines = this.wrapText(this.label, this.maxWidth);

    // Calculate the width of the wrapped text and the height of the diamond
    let w = max(this.maxWidth, textWidth(lines[0]));
    let h = lines.length * 20 + this.padding * 2;
    let radius = max(w, h) / 2;

    // Draw the diamond shape
    push();
    translate(this.x, this.y);
    fill(this.fixed ? '#b39916' : '#FF5B22');
    noStroke();

    beginShape();
    vertex(0, -radius);  // Top
    vertex(radius, 0);    // Right
    vertex(0, radius);    // Bottom
    vertex(-radius, 0);   // Left
    endShape(CLOSE);

    // Draw the text inside the diamond
    fill(255);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], 0, (i - lines.length / 2) * 20); // Vertically space the lines
    }
    pop();

    this.radius = radius;
  }

  // Wrap text into multiple lines based on maxWidth
  wrapText(text, maxWidth) {
    let words = text.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
      let testLine = currentLine + word + ' ';
      let testWidth = textWidth(testLine);
      if (testWidth > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine); // Add the last line

    return lines;
  }

  pressed() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.radius && !this.fixed) {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
    }
  }

  dragged() {
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }
  }

  released() {
    this.dragging = false;
  }
}

document.querySelectorAll('.slider-diamond').forEach(diamond => {
  diamond.addEventListener('mousedown', startDrag);

  function startDrag(e) {
    e.preventDefault();
    const slider = diamond.parentElement.querySelector('.slider-line');
    const sliderRect = slider.getBoundingClientRect();

    function onMouseMove(event) {
      let newX = event.clientX - sliderRect.left; // Calculate new X position
      newX = Math.max(0, Math.min(newX, sliderRect.width)); // Constrain within slider bounds
      diamond.style.left = `${newX}px`; // Move the diamond
    }

    function stopDrag() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopDrag);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', stopDrag);
  }
});
