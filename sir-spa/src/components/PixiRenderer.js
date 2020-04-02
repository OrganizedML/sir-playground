import * as PIXI from "pixi.js";
import React, { useRef, useState, useEffect } from "react";
import BunnyImage from "./bunny.png";

const agents = {};
let susceptibleTex;
let infectedTex;
let recoveredTex;
let app

const PixiRenderer = React.memo(({ agentList }) => {
  const stageContainer = useRef(null);

  Object.keys(agents).forEach((unique_id) => {
    let index = agentList.findIndex((agent) => {
      return agent.unique_id == unique_id
    })
    if (index === -1) {
      app.stage.removeChild(agents[unique_id])
      delete agents[unique_id]
    }
  })


  if (app && agentList) {
    agentList.forEach(agent => {
      let sprite;
      if (agent.unique_id in agents) {
        sprite = agents[agent.unique_id];
      } else {
        sprite = new PIXI.Sprite(susceptibleTex);
        sprite.width = 600/50
        sprite.height = 600/50
        app.stage.addChild(sprite);
        agents[agent.unique_id] = sprite;
      }
      if (agent.state == "infected") {
        sprite.texture = infectedTex;
      } else if (agent.state == "recovered") {
        sprite.texture = recoveredTex;
      } else if (agent.state == "susceptible") {
        sprite.texture = susceptibleTex;
      }
      sprite.x = agent.position[0] * (600 / 50);
      sprite.y = agent.position[1] * (600 / 50);
    });
  }

  // if (gameState.status === "running") {
  //   app.loader.reset();
  //   app.loader.add("bunny", BunnyImage).load((loader, resources) => {
  //       console.log(resources)
  //     // This creates a texture from a 'bunny.png' image
  //     const bunny = new PIXI.Sprite(resources.bunny.texture);

  //     // Setup the position of the bunny
  //     bunny.x = app.renderer.width / 2;
  //     bunny.y = app.renderer.height / 2;

  //     console.log(bunny.y)
  //     // Rotate around the center
  //     bunny.anchor.x = 0.5;
  //     bunny.anchor.y = 0.5;

  //     // Add the bunny to the scene we are building
  //     app.stage.addChild(bunny);

  //     // Listen for frame updates
  //     app.ticker.add(() => {
  //       // each frame we spin the bunny around a bit
  //       bunny.rotation += 0.01;
  //     });
  //   });
  // }

  useEffect(() => {
    app = new PIXI.Application({
      width: 600,
      height: 600,
      transparent: true
    });
    
    stageContainer.current.appendChild(app.view);

    let gr = new PIXI.Graphics();
    gr.beginFill(0x000000);
    gr.lineStyle(0);
    gr.drawCircle(600/50, 600/50, 600/50);
    gr.endFill();

    susceptibleTex = app.renderer.generateTexture(gr);

    gr = new PIXI.Graphics();
    gr.beginFill(0xff0000);
    gr.lineStyle(0);
    gr.drawCircle(600/50, 600/50, 600/50);
    gr.endFill();

    infectedTex = app.renderer.generateTexture(gr);

    gr = new PIXI.Graphics();
    gr.beginFill(0x00ff00);
    gr.lineStyle(0);
    gr.drawCircle(600/50, 600/50, 600/50);
    gr.endFill();

    recoveredTex = app.renderer.generateTexture(gr);
  }, []);

  return <div ref={stageContainer}></div>;
});

export { PixiRenderer };
