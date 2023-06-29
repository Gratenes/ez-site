import { Image, createCanvas, loadImage } from "canvas";

async function toPicture({ pictures }: { pictures: string[] }, uuid: string) {
  const Canvas = require("canvas");

  // Define the grid dimensions
  const rows = 2; // Number of rows in the grid
  const columns = 2; // Number of columns in the grid

  // Calculate the width and height of each picture in the grid
  const pictureWidth = Canvas.createCanvas().width / columns;
  const pictureHeight = Canvas.createCanvas().height / rows;

  // Create a new canvas to hold the combined pictures
  const canvas = Canvas.createCanvas(
    pictureWidth * columns,
    pictureHeight * rows
  );
  const context = canvas.getContext("2d");

  // Load all the pictures and draw them onto the canvas
  const loadImage = async (url: string | Buffer, x: number, y: number) => {
    const image = new Image();
    image.src = url;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        console.log("Loaded", url);
        context.drawImage(image, x, y, pictureWidth, pictureHeight);
        resolve();
      };

      image.onerror = reject;
    });
  };

  // Calculate the position for each picture in the grid
  let x = 0;
  let y = 0;

  // Iterate over each picture URL and load it onto the canvas
  for (let i = 0; i < pictures.length; i++) {
    await loadImage(pictures[i], x, y);

    // Move to the next position in the grid
    x += pictureWidth;

    if ((i + 1) % columns === 0) {
      // Move to the next row
      x = 0;
      y += pictureHeight;
    }
  }

  // Convert the canvas to a data URL
  const dataUrl = canvas.toDataURL();

  // Save the combined picture using the provided UUID
  // (You'll need to implement the logic to save the picture based on your specific requirements)
  return dataUrl;
}

export default toPicture;
