import * as PIXI from "pixi.js";
import React, { useRef, useState, useEffect } from "react";
import WorkImage_1 from "./icons8-business-buildings.svg";
import WorkImage_2 from "./icons8-organization.svg";
import WorkImage_3 from "./icons8-manufacturing.svg";
import ParkImage from "./icons8-park-with-street-light.svg";
import { GlowFilter } from "@pixi/filter-glow";

const agents = {};
const hotSpots = [];
let susceptibleTex;
let infectedTex;
let infectedUnrecognizedTex;
let recoveredTex;
let app;
let mainContainer;
const renderingSize = 600;
let infoText;

let elapsedTime = 0.0;

let renderIds = false;

let tickerFunc;

const PixiRenderer = React.memo(
  ({ worldState, worldWidth, worldHeight, stepDuration }) => {
    const stageContainer = useRef(null);

    // Initial app setup and resize
    useEffect(() => {
      if (!app && worldWidth && worldHeight) {
        app = new PIXI.Application({
          width: renderingSize,
          height: renderingSize,
          transparent: true,
          resizeTo: stageContainer.current,
          autoDensity: true,
        });
        mainContainer = new PIXI.Container();
        app.stage.addChild(mainContainer);
        stageContainer.current.appendChild(app.view);

        let gr = new PIXI.Graphics();
        gr.beginFill(0x000000);
        gr.lineStyle(0);
        gr.drawCircle(
          renderingSize / worldWidth,
          renderingSize / worldHeight,
          Math.min(renderingSize / worldWidth, renderingSize / worldHeight)
        );
        gr.endFill();

        susceptibleTex = app.renderer.generateTexture(gr);

        gr = new PIXI.Graphics();
        gr.beginFill(0xff0000);
        gr.lineStyle(0);
        gr.drawCircle(
          renderingSize / worldWidth,
          renderingSize / worldHeight,
          Math.min(renderingSize / worldWidth, renderingSize / worldHeight)
        );
        gr.endFill();

        infectedTex = app.renderer.generateTexture(gr);

        gr = new PIXI.Graphics();
        gr.beginFill(0x0000ff);
        gr.lineStyle(0);
        gr.drawCircle(
          renderingSize / worldWidth,
          renderingSize / worldHeight,
          Math.min(renderingSize / worldWidth, renderingSize / worldHeight)
        );
        gr.endFill();

        infectedUnrecognizedTex = app.renderer.generateTexture(gr);

        gr = new PIXI.Graphics();
        gr.beginFill(0x00ff00);
        gr.lineStyle(0);
        gr.drawCircle(
          renderingSize / worldWidth,
          renderingSize / worldHeight,
          Math.min(renderingSize / worldWidth, renderingSize / worldHeight)
        );
        gr.endFill();

        recoveredTex = app.renderer.generateTexture(gr);
      }
    }, [worldWidth, worldHeight]);

    // Game loop setup
    useEffect(() => {
      if (
        !app ||
        !mainContainer ||
        !worldHeight ||
        !worldWidth ||
        !stepDuration ||
        isNaN(renderingSize)
      ) {
        return;
      }
      app.ticker.remove(tickerFunc);
      tickerFunc = (deltaTime) => {
        elapsedTime += deltaTime / PIXI.settings.TARGET_FPMS / 1000;
        Object.keys(agents).forEach((unique_id) => {
          let agentInfo = agents[unique_id];
          let heightWidth = Math.min(
            app.renderer.width / worldWidth,
            app.renderer.height / worldHeight
          );
          agentInfo.sprite.x =
            agentInfo.oldPos[0] * (app.renderer.width / worldWidth) +
            (agentInfo.agent.position[0] * (app.renderer.width / worldWidth) -
              agentInfo.oldPos[0] * (app.renderer.width / worldWidth)) *
              Math.min(elapsedTime / stepDuration, 1.0);
          agentInfo.sprite.y =
            agentInfo.oldPos[1] * (app.renderer.height / worldHeight) +
            (agentInfo.agent.position[1] * (app.renderer.height / worldHeight) -
              agentInfo.oldPos[1] * (app.renderer.height / worldHeight)) *
              Math.min(elapsedTime / stepDuration, 1.0);
          agentInfo.sprite.width = heightWidth;
          agentInfo.sprite.height = heightWidth;
          if (renderIds) {
            agentInfo.text.x = agentInfo.sprite.x;
            agentInfo.text.y =
              agentInfo.sprite.y + app.renderer.height / worldHeight;
          }
        });
        hotSpots.forEach((hotSpotInfo) => {
          let heightWidth = Math.min(
            hotSpotInfo.strengthFactor * app.renderer.width,
            hotSpotInfo.strengthFactor * app.renderer.height
          );
          hotSpotInfo.sprite.x =
            hotSpotInfo.posX * (app.renderer.width / worldWidth) -
            heightWidth / 2;
          hotSpotInfo.sprite.y =
            hotSpotInfo.posY * (app.renderer.height / worldHeight) -
            heightWidth / 2;

          hotSpotInfo.sprite.width = heightWidth;
          hotSpotInfo.sprite.height = heightWidth;
        });
        if (infoText) {
          infoText.x = (app.renderer.width - infoText.width) / 2;
          infoText.y = (app.renderer.height - infoText.height) / 2;
        }
      };
      app.ticker.add(tickerFunc);
    }, [app, mainContainer, worldHeight, worldWidth, stepDuration]);

    // Initial world state setup
    useEffect(() => {
      if (app && mainContainer && worldState.hotSpots) {
        worldState.hotSpots.forEach((hotSpot) => {
          let hotSpotTex;
          if (
            hotSpot.group < 0 &&
            (hotSpot.tag === "default" || hotSpot.tag === "park")
          ) {
            let gr = new PIXI.Graphics();
            gr.beginFill(0x00ffff, 0.2);
            gr.lineStyle(0);
            gr.drawCircle(
              hotSpot.strength * renderingSize,
              hotSpot.strength * renderingSize,
              Math.min(
                hotSpot.strength * renderingSize,
                hotSpot.strength * renderingSize
              )
            );
            gr.endFill();
            hotSpotTex = app.renderer.generateTexture(gr);
            var strengthFactor = hotSpot.range / worldWidth;
          } else if (hotSpot.group == 1 && hotSpot.tag === "default") {
            hotSpotTex = PIXI.Texture.from(WorkImage_1);
            var strengthFactor = 0.2 * hotSpot.strength;
          } else if (hotSpot.group == 2 && hotSpot.tag === "default") {
            hotSpotTex = PIXI.Texture.from(WorkImage_2);
            var strengthFactor = 0.2 * hotSpot.strength;
          } else if (hotSpot.group == 3 && hotSpot.tag === "default") {
            hotSpotTex = PIXI.Texture.from(WorkImage_3);
            var strengthFactor = 0.2 * hotSpot.strength;
          }
          let hotSpotSprite = new PIXI.Sprite(hotSpotTex);
          mainContainer.addChild(hotSpotSprite);
          hotSpots.push({
            sprite: hotSpotSprite,
            posX: hotSpot.pos[0],
            posY: hotSpot.pos[1],
            strengthFactor: strengthFactor,
          });

          if (hotSpot.tag === "park") {
            hotSpotTex = PIXI.Texture.from(ParkImage);
            var strengthFactor = 0.2 * hotSpot.strength;

            let hotSpotSprite = new PIXI.Sprite(hotSpotTex);
            hotSpots.push({
              sprite: hotSpotSprite,
              posX: hotSpot.pos[0],
              posY: hotSpot.pos[1],
              strengthFactor: strengthFactor,
            });
            mainContainer.addChild(hotSpotSprite);
          }
        });
      }
    }, [app, mainContainer]);

    // Updates in every rerender...
    Object.keys(agents).forEach((unique_id) => {
      let index = worldState.agentList.findIndex((agent) => {
        return agent.unique_id == unique_id;
      });
      if (index === -1) {
        mainContainer.removeChild(agents[unique_id].sprite);
        if (renderIds) {
          mainContainer.removeChild(agents[unique_id].text);
        }
        delete agents[unique_id];
      } else {
        agents[unique_id].oldPos = agents[unique_id].agent.position;
        agents[unique_id].oldState = agents[unique_id].agent.state;

        agents[unique_id].agent = worldState.agentList[index];
      }
    });

    if (app && mainContainer && worldState) {
      worldState.agentList.forEach((agent) => {
        let sprite;
        let text;
        if (agent.unique_id in agents) {
          sprite = agents[agent.unique_id].sprite;
          if (renderIds) {
            text = agents[agent.unique_id].text;
          }
        } else {
          sprite = new PIXI.Sprite(susceptibleTex);


          mainContainer.addChild(sprite);
          if (renderIds) {
            text = new PIXI.Text(agent.unique_id.toString(), {
              fontFamily: "Arial",
              fontSize: 10,
              fill: 0x5555ff,
              align: "center",
            });
            mainContainer.addChild(text);
          }

          agents[agent.unique_id] = {
            text: text,
            sprite: sprite,
            agent: agent,
            oldPos: agent.position,
            oldState: agent.state,
          };
        }
        if (agent.state == "infected") {
          sprite.texture = infectedTex;
          if (agents[agent.unique_id].oldState !== "infected") {
            sprite.filters = [
              new GlowFilter({
                distance: 15,
                outerStrength: 2,
                color: 0xff0000,
              }),
            ];
          } else {
            sprite.filters = [];
          }
        } else if (agent.state == "infected_unrecognized") {
          sprite.texture = infectedUnrecognizedTex;
          if (agents[agent.unique_id].oldState !== "infected_unrecognized") {
            sprite.filters = [
              new GlowFilter({
                distance: 15,
                outerStrength: 2,
                color: 0x0000ff,
              }),
            ];
          } else {
            sprite.filters = [];
          }
        } else if (agent.state == "recovered") {
          sprite.texture = recoveredTex;
          if (agents[agent.unique_id].oldState !== "recovered") {
            sprite.filters = [
              new GlowFilter({
                distance: 15,
                outerStrength: 2,
                color: 0x00ff00,
              }),
            ];
          } else {
            sprite.filters = [];
          }
        } else if (agent.state == "susceptible") {
          sprite.texture = susceptibleTex;
        }
      });
    }

    // Display info screen if paused or stopped
    if (
      app &&
      (worldState.state == "stopped" || worldState.state == "paused")
    ) {
      app.stage.removeChild(infoText);
      mainContainer.filters = [new PIXI.filters.BlurFilter(12, 4, 1, 5)];
      infoText = new PIXI.Text(`The simulation is ${worldState.state}.`, {
        fontFamily: "Arial",
        fontSize: 24,
        fill: 0x000000,
        align: "center",
      });
      app.stage.addChild(infoText);
      infoText.filters = [];
    } else if (app && mainContainer) {
      mainContainer.filters = [];
      app.stage.removeChild(infoText);
    }

    elapsedTime = 0.0;
    return (
      <div
        style={{ width: "100%", height: "600px" }}
        ref={stageContainer}
      ></div>
    );
  }
);

export { PixiRenderer };
