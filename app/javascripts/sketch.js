import "../stylesheets/app.css";

export default function(state, options = {}) {
  if (!options.onSelect) {
    throw Error("Missing required property onSelect");
  }

  this._reference = new p5(instance => {
    const cHeight = 800,
      cWidth = 800,
      size = 8,
      columns = cWidth / size,
      rows = cHeight / size,
      magnifySize = Math.floor(size / 2 - 1) || 1,
      ignoredClassNames = ["color", "attempt-submit"];

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
      { r: 255, g: 255, b: 255 }, //White
      { r: 208, g: 222, b: 223 }
    ];

    let squareX, squareY;

    // Preload - gets called before setup or draw
    instance.preload = async () => {
      state.colorMap = new Array(columns);

      for (var x = 0; x < state.colorMap.length; x++) {
        state.colorMap[x] = new Array(rows);
        for (var y = 0; y < state.colorMap[x].length; y++) {
          state.colorMap[x][y] = state.colors.length - 1;
        }
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

    instance.smart_draw = () => {
      instance.strokeWeight(0);
      state.modifiedPixels.forEach(({x, y, color}) => {
        const {r, g, b} = state.colors[color];
        instance.fill(instance.color(r, g, b));
        instance.rect(
          magnifySize + x * size,
          magnifySize + y * size,
          size,
          size
        );
      })
      state.modifiedPixels = []
    }

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

      for (let x = 0; x < state.colorMap.length; x++) {
        for (let y = 0; y < state.colorMap[x].length; y++) {
          const idx = state.colorMap[x][y];
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

      const idx = state.colorMap[state.selected.x][state.selected.y];
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
        const minX = prev.x - 1 < 0 ? 0 : prev.x - 1,
          maxX = prev.x + 1 >= columns ? columns - 1 : prev.x + 1,
          minY = prev.y - 1 < 0 ? 0 : prev.y - 1,
          maxY = prev.y + 1 >= rows ? rows - 1 : prev.y + 1;

        for (var x = minX; x <= maxX; x++) {
          for (var y = minY; y <= maxY; y++) {
            const idx = state.colorMap[x][y];
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

    instance.mouseClicked = e => {
      const shouldIgnore = ignoredClassNames.some(className =>
        e.target.className.split(" ").some(term => term === className)
      );
      if (shouldIgnore) {
        return;
      }

      let { mouseX, mouseY } = instance;

      let prev = false;

      // Square Selection
      if (
        mouseX < magnifySize ||
        mouseY < magnifySize ||
        mouseX >= cWidth + magnifySize ||
        mouseY >= cHeight + magnifySize
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

        options.onSelect({
          active: true,
          x: Math.floor((mouseX - magnifySize) / size),
          y: Math.floor((mouseY - magnifySize) / size)
        });
      }
      updateCanvas(prev);
    };
  });
}
