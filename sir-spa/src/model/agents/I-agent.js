import { Agent } from "model/agents/basic-agent"

class Susceptible extends Agent {
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined, steps_since_infection=0) {

      super(unique_id, position, model, now_in_center, last_pos);

      this.infected = true;
      this.steps_since_infection = steps_since_infection;
    }
    
    
    // step
    step(){
        this.move()
        // interact agents
        // interact model - administration
    }

}