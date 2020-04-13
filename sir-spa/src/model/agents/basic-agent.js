import { Susceptible } from "./S-agent";

class Agent{
    constructor(unique_id, position, model, now_in_center=false,
        home=undefined, has_infected=0){
            this.unique_id = unique_id;
            this.position = position;
            this.now_in_center = now_in_center;
            this.model = model;
            this.home = home;
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
        // todo: fix parameters, random, pot and last step
        var potForce = this.model.space.get_potential_force(this);
        potForce = normalize_2D(potForce);
                    
        // random activity
        var random_multiplier = this.model.schedule_random_activity[this.model.current_mode];
        var schedule_speed = this.model.schedule_speed[this.model.current_mode];
        if (!(NAND(this.className == "Infected", this.model.stay_at_home))) {
            random_multiplier = 0;
            schedule_speed = 0.5;
        } else if (this.model.stronger_repulsion) {
            random_multiplier = 0;
        } else if (this.model.exit_lock) {
            random_multiplier = 0;
            schedule_speed *= 0.5;
        }
        
        potForce[0] += this.dx + random_multiplier * (Math.random() - 0.5) * 2;
        potForce[1] += this.dy + random_multiplier * (Math.random() - 0.5) * 2;
        
        // normalize Force - maybe scale instead? 0-2?
        potForce = normalize_2D(potForce);
        this.dx = potForce[0];
        this.dy = potForce[1];

        // Move, check if overlap, correct movement - left, right, random -dont move after a few tries
        // var next_move = this.model.space.get_valid_position_from_potForce(this, potForce);
        
        // w/o overlap check
        var next_move = [this.position[0] + this.dx * schedule_speed, this.position[1] + this.dy * schedule_speed];
        next_move = this.model.space.correct_boundaries(next_move);

        // admin overhead in space - world
        this.position = next_move;
        this.model.space.move_agent(this, this.position);
    }
    
    spread_infection() {
        var agents_inRange_UIDS = this.model.space.get_agents_inRange(this, this.model.infection_radius);

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
    if (norm < 0.01) {
        return [0, 0]
    } else {
        return [array[0]/norm, array[1]/norm]
    }
}

function NAND(x, y) {
	// You can use whatever JS operators that you would like: &&, ||, !
  return !(x && y);
}

export {Agent}