import { Agent } from "model/agents/basic-agent"

class Susceptible extends Agent {
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined, infected=false, steps_since_infection=0) {

      super(unique_id, position, model, now_in_center, last_pos);

      this.infected = infected;
      this.steps_since_infection = steps_since_infection;
    }
    
    // step
    step(){
        // move agent
        this.move()
        // interact with other agents
        if (this.infected) {
            if (this.steps_since_infection > this.model.duration_mean) {
                // move to removed
                // todo
            } else if (Math.random() < this.model.infection_recoginition_probability) {
                // move to infected
                // todo
            } else {
                // infected but not recognized
                this.spread_infection();
                this.steps_since_infection += 1;
            }
        }
    }

}

export { Susceptible }