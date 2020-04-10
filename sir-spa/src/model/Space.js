class Space {
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.agent_size = 1;
        this.agent_list = []

        // -> Nachbarschaftsliste - kontinuerlicher Raum - l n liste WiPro
        this.lc = [...Array(this.height)].map(x=>Array(this.width).fill(-1))  
        this.ll = new Array();
        this.ll[0] = [-1, -1, [0, 0]];

        this.home_multiplier = 0.25;
        this.center_multiplier = 0.25;
        this.repulsion_force_multiplier = 2;

        // potential fields
        this.attractive_points = new Array();
        this.load_world_layout("standard")
    }

    load_world_layout(selection) {
        if (selection == "standard") {
            this.add_attraction_at([Math.floor(this.width/2), Math.floor(this.width/2)], this.home_multiplier, ["work"], -1); // middle of grid as attractive force)
            this.add_attraction_at([10, this.height-10], 0.25, ["evening","morning"]); // up left
            this.add_attraction_at([this.width-10, this.height-10], 0.25, ["night"], 10); // up right
            this.add_attraction_at([10, 10], 0.25, ["evening","morning"]); // down left        
            this.add_attraction_at([this.width-10, 10], 0.25, ["evening","morning"]); // down right
        } else {
            // todo
        }
    }

    add_attraction_at(position, multiplier, active_at, influence_range=-1, group=-1) {
        // active_at should be list like ["night", "afterwork"]
        this.attractive_points.push([position, multiplier, active_at, influence_range, group]);// pos + value
    }

    // Linked Cell + Potential Field
    // each step: update linked cell
    // each movement: get potential force for each agent
    get_local_repulsion_positions(uid_list) {
        if (uid_list.length > 0) {
            var positions = new Array();
            var agents_inrange = this.agent_list.filter(function(value) {return uid_list.includes(value[0])}); // filter by uid

            for (var ag of agents_inrange) {
                positions.push(ag[1]); // add position of agents in range
            }
            
            return positions;
        } else {
            return [];
        }
    }

    get_potential_force(agent, alpha=1, beta=3) {
        var force_x_rep = 0;
        var force_y_rep = 0;
        var force_x_att = 0;
        var force_y_att = 0;

        var uid_list = this.inRange_linked_cell(agent.position, agent.unique_id, agent.model.repulsion_range); // range == infection range for movement
        var pos = this.get_local_repulsion_positions(uid_list);
        var group = this.agent_list.filter(function(el) {return el[0] === agent.unique_id ;})[3];
        
        for (var p of pos) {
            var dist = distance(agent.position, p);
            var U_grad_rep = this.repulsion_force_multiplier / Math.pow(dist, 2) *(1 / dist - 1/ (agent.model.repulsion_range + 0.1));

            if (dist > 0.001) {
                force_x_rep += - U_grad_rep * (agent.position[0] - p[0]) / dist;
                force_y_rep += - U_grad_rep * (agent.position[1] - p[1]) / dist;
            }   
        }

        for (var att of this.attractive_points) { //-\nabla U_{att}(\mathbf{x}) = -\alpha (\mathbf{x}-\mathbf{x_{goal}}) 
            if (att[2].includes(agent.model.current_mode)) {
                var dist = distance(agent.position, att[0]);

                if ((dist < att[3] || att[3] === -1) && (group === att[4] || att[4] === -1)) {
                    force_x_att += - att[1] * (agent.position[0] - att[0][0])/ dist;
                    force_y_att += - att[1] * (agent.position[1] - att[0][1])/ dist;
                }
            }            
        }

        if (force_x_att === 0 && force_y_att === 0) {
            var home_pos = this.agent_list.filter(function(ag) {return ag[0] == agent.unique_id;})[0];
            var dist = distance(agent.position, home_pos[2]); // home position
            
            if (dist > 0.001) {
                force_x_att = - this.home_multiplier * (agent.position[0] - home_pos[2][0])/ dist;
                force_y_att = - this.home_multiplier * (agent.position[1] - home_pos[2][1])/ dist;
            }            
        }
        // normalize  ?
        var grad_x = alpha*force_x_att - beta*force_x_rep;
        var grad_y = alpha*force_y_att - beta*force_y_rep;

        return [grad_x, grad_y] // todo weight rep and att
    }

    reset_linked_cell(range) {
        this.lc = [...Array(Math.floor(this.height/range)+1)].map(x=>Array(Math.floor(this.width/range)+1).fill(-1));
        this.current_range = range;
        this.ll.splice(0, this.ll.length);
        this.ll[0] = [-1, -1, [0, 0]];
    }

    update_linked_cell(range) {
        this.reset_linked_cell(range);

        var n = 0;
        for (var agent of this.agent_list) {
            var nx = Math.floor(agent[1][0] / range);
            var ny = Math.floor(agent[1][1] / range);

            this.ll[n] = [this.lc[nx][ny], agent[0], agent[1]]; // ll list hast index for linked cell method and uid
            this.lc[nx][ny] = n;
            n++;
        }
    }

    uids_in_cell_linked_cell(nx,ny) {
        var uids = new Array();
        var next;

        next = this.lc[nx][ny]; // index des ersten atoms auslesen
        while (this.ll[next][0] != -1) { //solange atome in Zelle nx, ny
            uids.push(this.ll[next][1]); // add uid to list
            next = this.ll[next][0]; // find next agent in ll
        }

        return uids
    }

    inRange_linked_cell(current_position, uid, range, with_position=false) {
        var nx; 
        nx = Math.floor(current_position[0] / range);
        var ny;
        ny = Math.floor(current_position[1] / range);

        var uids_inRange = new Array(); //  problem hier? array hatt 20.000 einträge
        var next;

        next = this.lc[nx][ny]; // index des ersten agenten auslesen
        if (next >= 0) {
            while (this.ll[next][0] != -1) { //solange atome in Zelle nx, ny
                if (uid != this.ll[next][1]) {
                    if (with_position) {
                        uids_inRange.push([this.ll[next][1], this.ll[next][2]]);
                    } else {
                        uids_inRange.push(this.ll[next][1]); // add uid to list
                    }
                }
                next = this.ll[next][0]; // find next agent in ll
            }
        }

        return uids_inRange
    }

    inRange_all_uids_linked_cell(current_position, range, with_position=false) {
        var nx = Math.floor(current_position[0] / range);
        var ny = Math.floor(current_position[1] / range);

        var uids_inRange = new Array();
        var next;

        next = this.lc[nx][ny]; // index des ersten atoms auslesen
        while (this.ll[next][0] != -1) { //solange atome in Zelle nx, ny
            if (with_position) {
                uids_inRange.push([this.ll[next][1], this.ll[next][2]]);              
            } else {
                uids_inRange.push(this.ll[next][1]); // add uid to list
            }
            next = this.ll[next][0]; // find next agent in ll
        }

        return uids_inRange
    }


    // Registration/Administration of agents
    //
    add_agent(agent, home, group=-1) {       
        this.agent_list.push([agent.unique_id, agent.position, home, group])
    }

    remove_agent(agent) {

        if (agent.unique_id !== "undefined") {
            var filtered = this.agent_list.filter(function(value, index, arr){ return value[0] != agent.unique_id;});

            if (filtered.length == (this.agent_list.length - 1)) {
                this.agent_list = filtered;

            } else {
                console.log("Error removing agent from world. UID not valid")
            }
        } else {
            console.log("Error setting up new agents")
        }
    }

    get_random_position_empty(radius_att_points=8) {
        do {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));

            var agents_in_position = this.agent_list.filter(function(element) {return distance(element[1], [x, y] < 0.5);});
            
            var att_point_valid_dist = true;
            for (var att of this.attractive_points) {
                if (distance(att[0], [x, y]) <= radius_att_points) {
                    att_point_valid_dist = false;
                }
            }

        } while (agents_in_position.length != 0 || att_point_valid_dist == false);

        return [x, y]
    }

    // overlap is ok
    /*
    get_valid_position_from_potForce(agent, potForce) {
        // todo
        var new_position = [agent.position[0] + potForce[0], agent.position[1] + potForce[1]];
        new_position = this.correct_boundaries(new_position);

        var nx = Math.floor(new_position[0] / this.current_range);
        var ny = Math.floor(new_position[1] / this.current_range);

        var arr_x = new Array();
        for (var tmp_x of [nx-1, nx, nx+1]) {
            if (tmp_x >= 0 && tmp_x <= Math.floor(this.width/this.current_range)) {
                arr_x.push(tmp_x);
            }
        }
        var arr_y = new Array();
        for (var tmp_y of [ny-1, ny, ny+1]) {
            if (tmp_y >= 0 && tmp_y <= Math.floor(this.height/this.current_range)) {
                arr_y.push(tmp_y);
            }
        }

        var uids_inRange = new Array();
        var next;

        for (var nx of arr_x) {
            for (var ny of arr_y) {
                next = this.lc[nx][ny]; // index des ersten agenten auslesen
                if (next >= 0) {
                    while (this.ll[next][0] != -1) { //solange atome in Zelle nx, ny
                        if (agent.unique_id != this.ll[next][1]) {
                            uids_inRange.push([this.ll[next][1], this.ll[next][2]]);
                        }
                        next = this.ll[next][0]; // find next agent in ll
                    }
                }
            }
        }

        var overlap = new Array();
        for (var ag of uids_inRange) {
            if (distance(new_position, ag[1]) < this.agent_size) {
                overlap.push(ag);
            }
        }
        
        // not done yet: todo

        return new_position
    }
    */

    correct_boundaries(pos) {
        if (pos[0] < 0) {
            pos[0] = 0;
        } else if (pos[0] > this.width) {
            pos[0] = this.width;
        }
        if (pos[1] < 0) {
            pos[1] = 0;
        } else if (pos[1] > this.height) {
            pos[1] = this.height;
        }

        return pos
    }

    get_agents_inRange(agent, infection_range) {
        // return uids of agents in range
        var list = new Array();
        var uids_pos_repulsion = this.inRange_linked_cell(agent.position, agent.unique_id, agent.model.repulsion_range, true); // [0]: uid; [1]: position
        
        for (var uid_pos of uids_pos_repulsion) {
            if (distance(agent.position, uid_pos[1]) < infection_range) {
                list.push(uid_pos[0]);
            }
        }

        return list
    }

    move_agent(agent, new_position) {
        
        var found_index = this.agent_list.findIndex(element => element[0] == agent.unique_id);
        var agent_inList = this.agent_list[found_index];

        if (agent_inList.length) {
            this.agent_list[found_index][1] = new_position;
        } else {
            console.log("Error moving agent")
        }
    }
}

function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}

function distance(array1, array2) {
    return Math.sqrt(Math.pow(array1[0] - array2[0], 2) + Math.pow(array1[1] - array2[1], 2));
}

export {Space}