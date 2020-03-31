import { Susceptible } from "model/agents/S-agent"
import { Removed } from "model/agents/R-agent"
import { Infected } from "model/agents/I-agent"
import { Space } from "model/Space"

class SIR_Model {
  // agent based SIR-Model
    constructor(
        population=200, 
        initial_infected=5, 
        infection_radius=2,
        infection_probability_onContact=0.25,
        duration_mean=10,
        infection_recoginition_probability=0.8,
        max_step=200
        ) {

      this.population = population;
      this.initial_infected = initial_infected;
      this.infection_radius = infection_radius;
      this.infection_probability_onContact = infection_probability_onContact;
      this.duration_mean = duration_mean;
      this.infection_recoginition_probability = infection_recoginition_probability;
      this.max_step = max_step;
      this.movement = "random";

      this.width = 20
      this.height = 20
      
    }

    reset() {
      if (typeof this.s_list !== "undefined") {
        //this.s_list.forEach(function(agent){ delete agent }); // no destructor?
        delete this.s_list;
      }

      if (typeof this.r_list !== "undefined") {
        //this.r_list.forEach(function(agent){ delete agent });
        delete this.r_list
      }

      if (typeof this.i_list !== "undefined") {
        //this.i_list.forEach(function(agent){ delete agent });
        delete this.i_list
      }
      if (typeof this.space !== "undefined") {
        delete this.space
      }

      // del every agent ?
    }

    initialize() {
      this.s_list = [];
      this.r_list = [];
      this.i_list = [];
      this.space = new Space(this.width, this.height);

      // setup population
      var unique_id;
      for (unique_id of range(1, (this.population - this.initial_infected))) {
        var pos = this.space.get_random_position_empty();

        var new_agent = new Susceptible(unique_id, pos, this);

        this.s_list.push(new_agent);
        
        this.space.add_agent(new_agent, pos);
      }

      //setup infected agents
      for (var u2 of range((unique_id + 1), (unique_id + this.initial_infected))) {
        var pos = this.space.get_random_position_empty();

        var new_agent = new Infected(u2, pos, this);

        this.i_list.push(new_agent);
        
        this.space.add_agent(new_agent, pos);
      }
    }

    step_s(){
      // call the step function for every agent + save class changes +
      // apply class changes +
      var to_r = [];
      var to_i = [];

      for (var key in this.s_list) {
        this.s_list[key].step()
      }
      // if class change -> no move -> directly apply change

      // calculate count
      var healthy = this.s_list.filter(function (el) {
        return !el.infected
      });

      return [healthy.length, this.s_list.length - healthy.length] 
    }

    step_i(){
      // call the step function for every agent + save class changes +
      // apply class changes +
      var to_r = [];

      for (var key in this.i_list) {
        this.i_list[key].step()
      }

      return this.i_list.length - to_r.length
    }
      
    step_r() {
      for (var key in this.r_list) {
        this.r_list[key].step()
      }

      return this.r_list.length
    }

    step(num) {
      var num_sus = this.step_s()
      var num_inf = this.step_i()
      var num_rem = this.step_r()
      // print canvas +
      // set current statistics as info for dashboard
      console.log("Susceptible:" + num_sus[0]);
      console.log("Susceptible with Infection:" + num_sus[1]);
      console.log("Identified Infected:" + num_inf);
      console.log("Removed - Recovered:" + num_rem);

      // DEBUG:
      /*
      var current_world = this.space.world;
      console.log("printing step: "+ num)
      for(var i = 0; i < current_world.length; i++) {
        for(var z = 0; z < current_world.length; z++) {
          console.log(current_world[z][i]);
        }
      }
      */
    }

    async run() {
      this.reset()
      this.initialize()
      for (var i of range(1, this.max_step)) {
        console.log("step"+i);
        this.step(i)
        await Sleep(500);
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

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export {SIR_Model}