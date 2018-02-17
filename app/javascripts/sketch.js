import "../stylesheets/app.css";

export default function(state) {
  const _reference = new p5(instance => {
    const cHeight = 500,
      cWidth = 500,
      size = 5,
      columns = cWidth / size,
      rows = cHeight / size,
      magnifySize = size / 2 - 1 || 1;

    const colors = [
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

      function rand(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }
    };

    //Setup - Creates canvas commences drawing
    instance.setup = () => {
      const canvas = instance.createCanvas(cWidth, cHeight);
      canvas.parent("application");
      instance.frameRate(0);
      instance.draw();
    };

    //Draw
    instance.draw = () => {
      drawGrid();
      drawSelected();
    };

    //Draws grid
    function drawGrid() {
      instance.strokeWeight(0);

      for (let x = 0; x < colorMap.length; x++) {
        for (let y = 0; y < colorMap[x].length; y++) {
          const idx = colorMap[x][y];
          const { r, g, b } = colors[idx];
          instance.fill(instance.color(r, g, b));
          instance.rect(x * size, y * size, size, size);
        }
      }
    }

    function drawSelected() {
      if (!state.selected.active) return;

      const idx = colorMap[state.selected.x][state.selected.y];
      const { r, g, b } = colors[idx];

      instance.strokeWeight(1);
      instance.fill(instance.color(r, g, b));
      instance.rect(
        state.selected.x * size - magnifySize,
        state.selected.y * size - magnifySize,
        size + magnifySize * 2,
        size + magnifySize * 2
      );
    }

    instance.mouseClicked = async () => {
      const { mouseX, mouseY } = instance;
      // Square Selection
      if (mouseX > 0 && mouseY > 0 && mouseX < cWidth && mouseY < cHeight) {
        state.selected.active = true;

        state.selected.x = Math.floor(mouseX / size);
        state.selected.y = Math.floor(mouseY / size);

        console.log(
          `Click at ${mouseX}, ${mouseY} === ${state.selected.x}, ${
            state.selected.y
          }`
        );

        instance.draw();
      }
    };
  });
}
