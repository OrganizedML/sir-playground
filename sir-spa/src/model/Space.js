class Space {
    constructor(width, height){
        this.width = width;
        this.height = height;
        // only 2D - only 1 agent per cell
        this.world = [...Array(this.height)].map(x=>Array(this.width).fill([0, 0]))  
        this.agent_list = []
    }

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

            if (filtered.length == 1) {
                
                this.agent_list = filtered;

            } else {

                console.log("Error removing agent from world. UID not found")

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

export {Space}