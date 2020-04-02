import { Susceptible } from "./S-agent";

class Agent{
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined, has_infected=0){
            this.unique_id = unique_id;
            this.position = position;
            this.now_in_center = now_in_center;
            this.model = model;
            this.last_pos = last_pos;
            this.has_infected = has_infected;

            this.x = undefined;
            this.y = undefined;
        }
    
    // movement
    move() {
        if (this.model.movement === "random"){
            var next_moves = this.model.space.get_neighborhood_empty(this.position);
            next_moves.push(this.position);

            var next_move = random_choice(next_moves);

        } else if (this.model.movement === "center") {
            // todo
        }

        // admin overhead in space - world
        this.position = next_move;
        this.model.space.move_agent(this, next_move);
    }
    
    spread_infection() {
        var agents_inRange_UIDS = this.model.space.get_agents_inRange(this.position, this.model.infection_radius);

        for (var uid of agents_inRange_UIDS) {
            var agent = this.model.s_list.filter(function(object, index, arr){ return object.unique_id === uid;})[0];
            if (typeof agent !== "undefined") {
                if (agent.className == "Susceptible" && agent.infected == false && Math.random() < this.model.infection_probability_onContact) {
                    agent.infected = true;
                    this.has_infected += 1;
                }
            }
        }
    }
}

function random_choice(moves) {
    var move = moves[Math.floor(Math.random() * moves.length)];
    return move
}

export {Agent}