import { Agent } from "model/agents/basic-agent"

class Removed extends Agent {
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined, infected=false, steps_since_infection=0) {
        super(unique_id, position, model, now_in_center, last_pos);
    }
    
    
    // step
    step(){
        this.move()
        // interact agents - No interaction
        // interact model - administration - no administration changes?
    }

}

export { Removed }