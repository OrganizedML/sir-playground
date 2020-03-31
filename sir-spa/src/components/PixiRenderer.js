import * as PIXI from "pixi.js";
import React, { useRef, useState, useEffect } from "react";
import BunnyImage from "./bunny.png"

const PixiRenderer = ({ gameState }) => {
  const [app, setApp] = useState(null);
  const stageContainer = useRef(null);

  if (gameState.status === "running") {
    app.loader.reset();
    app.loader.add("bunny", BunnyImage).load((loader, resources) => {
        console.log(resources)
      // This creates a texture from a 'bunny.png' image
      const bunny = new PIXI.Sprite(resources.bunny.texture);

      // Setup the position of the bunny
      bunny.x = app.renderer.width / 2;
      bunny.y = app.renderer.height / 2;

      console.log(bunny.y)
      // Rotate around the center
      bunny.anchor.x = 0.5;
      bunny.anchor.y = 0.5;

      // Add the bunny to the scene we are building
      app.stage.addChild(bunny);

      // Listen for frame updates
      app.ticker.add(() => {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;
      });
    });
  }

  useEffect(() => {
    let app = new PIXI.Application({
      width: 600,
      height: 600,
      transparent: false
    });
    setApp(app);
    stageContainer.current.appendChild(app.view);
  }, []);

  return <div ref={stageContainer}></div>;
};

export { PixiRenderer };
