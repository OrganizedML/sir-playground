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

            this.dx = (Math.random() - 0.5) * 2;
            this.dy = (Math.random() - 0.5) * 2;
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

    // movement
    hotspot_move() {
        var empyt_cells = [];
        var potForce = this.model.space.get_potential_force(this);
        // todo normalize?
        potForce[0] += this.dx + (Math.random() - 0.5) * 2;
        potForce[1] += this.dy + (Math.random() - 0.5) * 2;
        
        potForce = normalize_2D(potForce);
        this.dx = potForce[0];
        this.dy = potForce[1];

        // move only in empty cell - otherwise dont move - testing - todo
        empyt_cells = this.model.space.get_neighborhood_empty(this.position);
        var new_pos = [Math.round(this.position[0] + potForce[0]), Math.round(this.position[1] + potForce[1])];
        //var valid = empyt_cells.filter(function(value) {value[0] == this.new_pos[0] && value[1] == this.new_pos[1]}, new_pos);
        var valid = false;
        for (var empty_cell of empyt_cells) {
            if (empty_cell[0] == new_pos[0] && empty_cell[1] == new_pos[1]) {
                valid = true;
                break;
            }
        }

        if (valid == 1) {
            var next_move = new_pos;
        } else {
            var next_move = this.position;
        }

        // admin overhead in space - world
        this.position = floor_position(next_move);
        this.model.space.move_agent(this, this.position);
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

function floor_position(position) {
    return [Math.floor(position[0]), Math.floor(position[1])]
}

function normalize_2D(array) {
    var norm = Math.sqrt(Math.pow(array[0], 2) + Math.pow(array[1], 2));
    return [array[0]/norm, array[1]/norm]
}

export {Agent}