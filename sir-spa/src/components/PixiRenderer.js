import * as PIXI from "pixi.js";
import React, { useRef, useState, useEffect } from "react";
import BunnyImage from "./bunny.png";

const agents = {};
let susceptibleTex;
let infectedTex;
let infectedUnrecognizedTex;
let recoveredTex;
let app;
const renderWidth = 600;
const renderHeight = 600;
let elapsedTime = 0.0;

let tickerFunc;

const PixiRenderer = React.memo(
  ({ agentList, worldWidth, worldHeight, stepDuration }) => {
    const stageContainer = useRef(null);

    Object.keys(agents).forEach((unique_id) => {
      let index = agentList.findIndex((agent) => {
        return agent.unique_id == unique_id;
      });
      if (index === -1) {
        app.stage.removeChild(agents[unique_id].sprite);
        app.stage.removeChild(agents[unique_id].text);
        delete agents[unique_id];
      } else {
        agents[unique_id].oldPos = agents[unique_id].agent.position;

        agents[unique_id].agent = agentList[index];
      }
    });

    if (app && agentList) {
      agentList.forEach((agent) => {
        let sprite;
        let text;
        if (agent.unique_id in agents) {
          sprite = agents[agent.unique_id].sprite;
          text = agents[agent.unique_id].text;
        } else {
          sprite = new PIXI.Sprite(susceptibleTex);

          sprite.width = renderWidth / worldWidth;
          sprite.height = renderHeight / worldHeight;
          app.stage.addChild(sprite);

          text = new PIXI.Text(agent.unique_id.toString(), {
            fontFamily: "Arial",
            fontSize: 10,
            fill: 0x5555ff,
            align: "center",
          });

          app.stage.addChild(text);

          agents[agent.unique_id] = {
            text: text,
            sprite: sprite,
            agent: agent,
            oldPos: agent.position,
          };
        }
        if (agent.state == "infected") {
          sprite.texture = infectedTex;
        } else if (agent.state == "infected_unrecognized") {
          sprite.texture = infectedUnrecognizedTex;
        } else if (agent.state == "recovered") {
          sprite.texture = recoveredTex;
        } else if (agent.state == "susceptible") {
          sprite.texture = susceptibleTex;
        }
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
      if (!worldHeight || !worldWidth || !stepDuration) {
        return;
      }
      if (!app) {
        app = new PIXI.Application({
          width: renderWidth,
          height: renderHeight,
          transparent: true,
        });
        stageContainer.current.appendChild(app.view);

        let gr = new PIXI.Graphics();
        gr.beginFill(0x000000);
        gr.lineStyle(0);
        gr.drawCircle(
          renderWidth / worldWidth,
          renderHeight / worldHeight,
          Math.min(renderWidth / worldWidth, renderHeight / worldHeight)
        );
        gr.endFill();

        susceptibleTex = app.renderer.generateTexture(gr);

        gr = new PIXI.Graphics();
        gr.beginFill(0xff0000);
        gr.lineStyle(0);
        gr.drawCircle(
          renderWidth / worldWidth,
          renderHeight / worldHeight,
          Math.min(renderWidth / worldWidth, renderHeight / worldHeight)
        );
        gr.endFill();

        infectedTex = app.renderer.generateTexture(gr);

        gr = new PIXI.Graphics();
        gr.beginFill(0x0000ff);
        gr.lineStyle(0);
        gr.drawCircle(
          renderWidth / worldWidth,
          renderHeight / worldHeight,
          Math.min(renderWidth / worldWidth, renderHeight / worldHeight)
        );
        gr.endFill();

        infectedUnrecognizedTex = app.renderer.generateTexture(gr);

        gr = new PIXI.Graphics();
        gr.beginFill(0x00ff00);
        gr.lineStyle(0);
        gr.drawCircle(
          renderWidth / worldWidth,
          renderHeight / worldHeight,
          Math.min(renderWidth / worldWidth, renderHeight / worldHeight)
        );
        gr.endFill();

        recoveredTex = app.renderer.generateTexture(gr);
      }
      app.ticker.remove(tickerFunc);
      tickerFunc = (deltaTime) => {
        elapsedTime += deltaTime / PIXI.settings.TARGET_FPMS / 1000;
        Object.keys(agents).forEach((unique_id) => {
          let agentInfo = agents[unique_id];
          if (!agentInfo.oldPos) {
            console.log(agentInfo);
          }

          agentInfo.sprite.x =
            agentInfo.oldPos[0] * (renderWidth / worldWidth) +
            (agentInfo.agent.position[0] * (renderWidth / worldWidth) -
              agentInfo.oldPos[0] * (renderWidth / worldWidth)) *
              Math.min(elapsedTime / stepDuration, 1.0);
          agentInfo.sprite.y =
            agentInfo.oldPos[1] * (renderHeight / worldHeight) +
            (agentInfo.agent.position[1] * (renderHeight / worldHeight) -
              agentInfo.oldPos[1] * (renderHeight / worldHeight)) *
              Math.min(elapsedTime / stepDuration, 1.0);

          agentInfo.text.x = agentInfo.sprite.x;
          agentInfo.text.y = agentInfo.sprite.y + renderHeight / worldHeight;
        });
      };
      app.ticker.add(tickerFunc);
    }, [worldHeight, worldWidth, stepDuration]);
    elapsedTime = 0.0;
    return <div ref={stageContainer}></div>;
  }
);

export { PixiRenderer };
