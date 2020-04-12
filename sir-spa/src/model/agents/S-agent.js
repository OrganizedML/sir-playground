import { Agent } from "model/agents/basic-agent"

class Susceptible extends Agent {
    constructor(unique_id, position, model, now_in_center=false,
        home=undefined, infected=false, steps_since_infection=0,
        has_infected=0) {

      super(unique_id, position, model, now_in_center, home, has_infected);

      this.infected = infected;
      this.steps_since_infection = steps_since_infection;
      this.className = "Susceptible";

      this.duration = this.model.duration_mean + getRandomInt(-1, 1);
    }
    
    // step
    step(){
        var to_i = -1;
        var to_r = -1;

        // todo: faster if not whole array?
        // interact with other agents
        if (this.infected && this.steps_since_infection > this.model.steps_till_symptoms) {
            if (Math.floor(this.steps_since_infection / this.model.steps_each_day) > this.duration) {
                to_r = this.unique_id;

            } else if (Math.random() < this.model.infection_recoginition_probability) {
                to_i = this.unique_id;

            } else {
                // infected but not recognized
                this.spread_infection();
                // move agent
                // this.move()
                this.hotspot_move()
                // spread in new position
                this.spread_infection();
                this.steps_since_infection += 1;
            }
        } else if (this.infected) {
            this.steps_since_infection += 1;
        }
        
        // move agent
        this.hotspot_move()
                
        // interact with admin
        return [to_r, to_i]
    }

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

export { Susceptible }