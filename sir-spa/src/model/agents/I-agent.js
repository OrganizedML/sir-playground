import { Agent } from "model/agents/basic-agent"

class Infected extends Agent {
    constructor(unique_id, position, model, now_in_center=false,
        home=undefined, steps_since_infection=0,
        has_infected=0) {

      super(unique_id, position, model, now_in_center, home, has_infected);

      this.infected = true;
      this.steps_since_infection = steps_since_infection;
      this.className = "Infected";

      this.duration = this.model.duration_mean + getRandomInt(-1, 1);
    }
    
    
    // step
    step(){
        var to_r = -1

        // interact agents
        if (Math.floor(this.steps_since_infection / this.model.steps_each_day) > this.duration) {
            to_r = this.unique_id

        } else {
            this.spread_infection();
            // move
            this.hotspot_move()

            // spread in new position
            this.spread_infection();
            this.steps_since_infection += 1;
        }

        // interact model - administration
        return to_r
    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { Infected }