class Space {
    constructor(width, height){
        this.width = width;
        this.height = height;
        // only 2D - only 1 agent per cell
        this.world = [...Array(this.height)].map(x=>Array(this.width).fill([0, 0]))  
        this.agent_list = []

        // -> Nachbarschaftsliste - kontinuerlicher Raum - l n liste WiPro
        this.lc = [...Array(this.height)].map(x=>Array(this.width).fill(-1))  
        this.ll = [-1];

        // potential fields
        this.attractive_points = new Array();
        this.add_attraction_at([Math.floor(this.width/2), Math.floor(this.width/2)], 0.25); // middle of grid as attractive force)

        this.add_attraction_at([10, this.height-10], 0.25); // up left
        this.add_attraction_at([this.width-10, this.height-10], 0.25); // up right
        this.add_attraction_at([10, 10], 0.25); // down left        
        this.add_attraction_at([this.width-10, 10], 0.25); // down right

        this.repulsion_force_multiplier = 2;
        this.lc = [...Array(this.height)].map(x=>Array(this.width).fill(-1))  
        this.ll = new Array();
        this.ll[0] = [-1, -1];
    }


    // Linked Cell + Potential Field
    // each step: update linked cell
    // each movement: get potential force for each agent
    add_attraction_at(position, multiplier) {
        this.attractive_points.push([position, multiplier]);// pos + value
    }

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
        
        for (var p of pos) {
            var dist = distance(agent.position, p);
            var U_grad_rep = this.repulsion_force_multiplier / Math.pow(dist, 2) *(1 / dist - 1/ agent.model.repulsion_range);
            
            // normalize
            force_x_rep += - U_grad_rep * (agent.position[0] - p[0]) / dist;
            force_y_rep +=  -U_grad_rep * (agent.position[1] - p[1]) / dist;
        }
      
        for (var att of this.attractive_points) { //-\nabla U_{att}(\mathbf{x}) = -\alpha (\mathbf{x}-\mathbf{x_{goal}}) 
            var dist = distance(agent.position, att[0]);

            // normalize 
            force_x_att += - att[1] * (agent.position[0] - att[0][0])/ dist;
            force_y_att += - att[1] * (agent.position[1] - att[0][1])/ dist;
            
        }
        return [alpha*force_x_att + beta*force_x_rep, alpha*force_y_att + beta*force_y_rep] // todo weight rep and att
    }

    reset_linked_cell(range) {
        this.lc = [...Array(Math.floor(this.height/range)+1)].map(x=>Array(Math.floor(this.width/range)+1).fill(-1))  
        this.ll.splice(0, this.ll.length);
        this.ll[0] = [-1, -1]
    }

    update_linked_cell(range) {
        this.reset_linked_cell(range);

        var n = 0;
        for (var agent of this.agent_list) {
            var nx = Math.floor(agent[1][0] / range);
            var ny = Math.floor(agent[1][1] / range);

            this.ll[n] = [this.lc[nx][ny], agent[0]]; // ll list hast index for linked cell method and uid
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

    inRange_linked_cell(current_position, uid, range) {
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
                    uids_inRange.push(this.ll[next][1]); // add uid to list
                }
                next = this.ll[next][0]; // find next agent in ll
            }
        }

        return uids_inRange
    }

    inRange_all_uids_linked_cell(current_position, range) {
        var nx = Math.floor(current_position[0] / range);
        var ny = Math.floor(current_position[1] / range);

        var uids_inRange = new Array();
        var next;

        next = this.lc[nx][ny]; // index des ersten atoms auslesen
        while (this.ll[next][0] != -1) { //solange atome in Zelle nx, ny
            uids_inRange.push(this.ll[next][1]); // add uid to list
            next = this.ll[next][0]; // find next agent in ll
        }

        return uids_inRange
    }


    // 2D - GRID
    //
    add_agent(agent, position) {

        var info = [1, agent.unique_id];

        if (agent.position == position) {
            this.world[position[0]][position[1]] = info;
            this.agent_list.push([agent.unique_id, position])

        } else {
            console.log("Error setting up new agents")
        }
    }

    remove_agent(agent) {

        if (agent.unique_id !== "undefined") {
            this.world[agent.position[0]][agent.position[1]] = [0, 0];
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

    get_random_position_empty() {

        do {
            var x = Math.floor((Math.random() * this.width));
            var y = Math.floor((Math.random() * this.height));
          } while (this.world[x][y][0] != 0);

        return [x, y]
    }


    get_neighborhood_empty(position) {

        var list = [];
        // Rand ist Ende der Welt
        for(var x of range((position[0]-1), (position[0]+1))) {
            if (x < this.width && x >= 0) {
                for(var y of range((position[1] - 1), (position[1] + 1))) {
                    if (y < this.height && y >= 0) {
                        if (this.world[x][y][0] == 0 && [x,y] != position) {
                            list.push([x,y]);
                        }
                    }
                }
            }
        }
        
        return list
    }

    get_agents_inRange(position, infection_range) {

        var list = [];
        // Rand ist Ende der Welt
        for(var x of range((position[0]-infection_range), (position[0]+infection_range))) {
            if (x < this.width && x >= 0) {
                for(var y of range((position[1]-infection_range), (position[1]+infection_range))) {
                    if (y < this.height && y >= 0) {
                        if (this.world[x][y][0] == 1 && [x,y] != position) {
                            list.push(this.world[x][y][1]); // push the unique_id
                        }
                    }
                }
            }
        }
        // return uids of agents in range
        return list
    }

    move_agent(agent, new_position) {
        
        var found_index = this.agent_list.findIndex(element => element[0] == agent.unique_id);
        var agent_inList = this.agent_list[found_index];
        

        if (agent_inList.length ) {
            var old_pos = agent_inList[1];

            this.world[old_pos[0]][old_pos[1]] = [0, 0];
            this.world[new_position[0]][new_position[1]] = [1, agent.unique_id];
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