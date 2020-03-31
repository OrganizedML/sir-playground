import { func } from "C:/Users/mariu/AppData/Local/Microsoft/TypeScript/3.2/node_modules/@types/prop-types";

class Agent{
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined){
            this.unique_id = unique_id;
            this.position = position;
            this.now_in_center = now_in_center;
            this.model = model;
            this.last_pos = last_pos;

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

        // var nonInfected_agents_inRange = []
        for (var uid in agents_inRange_UIDS) {
            if (uid in this.model.s_list && this.model.s_list[uid].infected == false && Math.random() < this.model.infection_probability_onContact) {
                // nonInfected_agents_inRange.push(uid);
                this.model.s_list[uid].infected = true;
            }
        }
        
    }
}

function random_choice(moves) {
    var move = moves[Math.floor(Math.random() * moves.length)];
    return move
}

export {Agent}