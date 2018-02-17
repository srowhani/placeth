import "../stylesheets/app.css";

export default function(state) {
  const _reference = new p5(instance => {
    const cHeight = 800,
      cWidth = 800,
      size = 8,
      columns = cWidth / size,
      rows = cHeight / size,
      magnifySize = Math.floor(size / 2 - 1) || 1;

    state.colors = [
      { r: 34, g: 34, b: 34 }, //Black
      { r: 229, g: 0, b: 0 }, //Red
      { r: 130, g: 0, b: 128 }, //Purple
      { r: 160, g: 106, b: 66 }, //Brown
      { r: 136, g: 136, b: 136 }, //Grey
      { r: 148, g: 224, b: 68 }, //Light Green
      { r: 207, g: 110, b: 228 }, //Light Purple
      { r: 228, g: 228, b: 22 }, //Light Grey
      { r: 2, g: 190, b: 1 }, //Green
      { r: 0, g: 0, b: 234 }, //Royal Blue
      { r: 0, g: 131, b: 199 }, //Light Blue
      { r: 229, g: 149, b: 0 }, //Orange/Gold
      { r: 0, g: 211, b: 221 }, //Cyan
      { r: 229, g: 217, b: 0 }, //Yellow
      { r: 255, g: 167, b: 209 }, //Pink
      { r: 255, g: 255, b: 255 } //White
    ];

    let colorMap, squareX, squareY;

    // Preload - gets called before setup or draw
    instance.preload = async () => {
      colorMap = new Array(columns);

      for (var x = 0; x < colorMap.length; x++) {
        colorMap[x] = new Array(rows);
        for (var y = 0; y < colorMap[x].length; y++) {
          colorMap[x][y] = rand(16);
        }
      }

      console.log(`${cWidth + magnifySize * 2} x ${cHeight + magnifySize * 2}`);

      function rand(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
    };

    //Setup - Creates canvas commences drawing
    instance.setup = () => {
      const canvas = instance.createCanvas(
        1 + cWidth + magnifySize * 2,
        1 + cHeight + magnifySize * 2
      );
      canvas.parent("application");
      instance.frameRate(0);
      instance.draw();
    };

    //Draw
    instance.draw = () => {
      drawBorder();
      drawGrid();
      drawSelected();
    };

    function drawBorder() {
      instance.strokeWeight(0);
      instance.fill("white");
      //Top bar
      instance.rect(0, 0, cWidth + magnifySize * 2, magnifySize);

      //Bottom bar
      instance.rect(
        0,
        cHeight + magnifySize,
        cWidth + magnifySize * 2,
        magnifySize + 1
      );

      //Left bar
      instance.rect(0, 0, magnifySize, cHeight + magnifySize * 2);

      //Right bar
      instance.rect(
        cWidth + magnifySize,
        0,
        magnifySize + 1,
        cHeight + magnifySize * 2
      );
    }

    //Draws grid
    function drawGrid() {
      instance.strokeWeight(0);

      for (let x = 0; x < colorMap.length; x++) {
        for (let y = 0; y < colorMap[x].length; y++) {
          const idx = colorMap[x][y];
          const { r, g, b } = state.colors[idx];
          instance.fill(instance.color(r, g, b));
          instance.rect(
            magnifySize + x * size,
            magnifySize + y * size,
            size,
            size
          );
        }
      }
    }

    function drawSelected() {
      if (!state.selected.active) return;

      const idx = colorMap[state.selected.x][state.selected.y];
      const { r, g, b } = state.colors[idx];

      instance.strokeWeight(1);
      instance.fill(instance.color(r, g, b));
      instance.rect(
        state.selected.x * size,
        state.selected.y * size,
        size + magnifySize * 2,
        size + magnifySize * 2
      );
    }

    function updateCanvas(prev) {
      drawBorder();

      if (prev) {
        //Fix bugs
        var minX = prev.x - 1 < 0 ? 0 : prev.x - 1;
        for (var x = prev.x - 1; x <= prev.x + 1; x++) {
          for (var y = prev.y - 1; y <= prev.y + 1; y++) {
            const idx = colorMap[x][y];
            const { r, g, b } = state.colors[idx];
            instance.fill(instance.color(r, g, b));
            instance.rect(
              magnifySize + x * size,
              magnifySize + y * size,
              size,
              size
            );
          }
        }
      }

      drawSelected();
    }

    instance.mouseClicked = async () => {
      const { mouseX, mouseY } = instance;
      let prev = false;

      console.log(mouseX, mouseY);
      console.log(state.selected);

      // Square Selection
      if (
        mouseX < magnifySize ||
        mouseY < magnifySize ||
        mouseX > cWidth + magnifySize ||
        mouseY > cHeight + magnifySize
      ) {
        //Unselect square (by clicking elsewhere)
        state.selected.active = false;
        prev = {
          x: state.selected.x,
          y: state.selected.y
        };
      } else {
        //Select new
        if (state.selected.active) {
          prev = {
            x: state.selected.x,
            y: state.selected.y
          };
        }

        state.selected = {
          active: true,
          x: Math.floor((mouseX - magnifySize) / size),
          y: Math.floor((mouseY - magnifySize) / size)
        };
      }

      updateCanvas(prev);
    };
  });
}
