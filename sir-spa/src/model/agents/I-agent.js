import { Agent } from "model/agents/basic-agent"

class Infected extends Agent {
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined, steps_since_infection=0) {

      super(unique_id, position, model, now_in_center, last_pos);

      this.infected = true;
      this.steps_since_infection = steps_since_infection;
      this.className = "Infected";
    }
    
    
    // step
    step(){
        var to_r = -1

        // interact agents
        if (this.steps_since_infection > this.model.duration_mean) {
            to_r = this.unique_id

        } else {
            this.spread_infection();
            // move
            this.move()

            // spread in new position
            this.spread_infection();
            this.steps_since_infection += 1;
        }

        // interact model - administration
        return to_r
    }

}

export { Infected }