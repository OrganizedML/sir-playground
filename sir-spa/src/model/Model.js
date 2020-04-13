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
        duration_mean=5,
        infection_recoginition_probability=0.8,
        max_step=400,
        stay_at_home=false,
        stronger_repulsion=false,
        exit_lock = false
        ) {

      this.population = population;
      this.initial_infected = initial_infected;
      this.infection_radius = infection_radius;
      this.infection_probability_onContact = infection_probability_onContact;
      this.duration_mean = duration_mean;
      this.infection_recoginition_probability = infection_recoginition_probability;
      this.max_step = max_step;
      this.repulsion_range = 5; // has to be greater than infection range
      this.steps_till_symptoms = 60;
      
      // map
      this.width = 50;
      this.height = 50;
      
      // controls
      this.stay_at_home = stay_at_home;
      this.stronger_repulsion = stronger_repulsion;
      this.exit_lock = exit_lock;

      // schedule - night - morning - work - afterwork - evening
      this.steps_each_day = 60; // half an hour
      this.step_num = 0;
      this.day = 0;
      this.current_mode = "night";
      this.schedule = {
        "night": 9,
        "morning": 19,
        "work": 44,
        "afterwork": 54,
        "evening": 59
      }
      this.schedule_random_activity = {
        "night": 0.1,
        "morning": 2,
        "work": 0.1,
        "afterwork": 0.5,
        "evening": 1.5
      }
      this.schedule_speed = {
        "night": 0.8,
        "morning": 1.2,
        "work": 2,
        "afterwork": 2,
        "evening": 1
      }    
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
      if (this.infection_radius > this.repulsion_range) {
        console.log("Error: Infection range has to be smaller or equal to repulsion range. Set to repulsion range");
        this.infection_radius = this.repulsion_range;
      }

      // agents
      this.s_list = [];
      this.r_list = [];
      this.i_list = [];

      // R0
      this.old_R = new Array();
      this.old_R.push(0);
      this.old_I = new Array();
      this.old_I.push(this.initial_infected);
      this.old_S = new Array();
      this.old_S.push(this.population - this.initial_infected);
      this.R_array = new Array();

      // grid world model
      this.space = new Space(this.width, this.height);
      
      // schedule
      this.day = 0;
      this.step_num = 0;
      this.current_mode = "night";

      // setup population
      var unique_id;
      for (unique_id of range(1, (this.population - this.initial_infected))) {
        var pos = this.space.get_random_position_empty(8);
        var new_agent = new Susceptible(unique_id, pos, this, false, pos);

        // register agent
        this.s_list.push(new_agent);
        this.space.add_agent(new_agent, pos, getRandomInt(1,3));
      }

      //setup infected agents
      for (var u2 of range((unique_id + 1), (unique_id + this.initial_infected))) {
        pos = this.space.get_random_position_empty(8);
        new_agent = new Infected(u2, pos, this, false, pos);

        // register agent
        this.i_list.push(new_agent);
        this.space.add_agent(new_agent, new_agent.home, getRandomInt(1,3));
      }
    }

    set_stay_at_home(bool) {
      this.stay_at_home = bool;
    }

    set_exit_lock(bool) {
      this.exit_lock = bool;
    }
    
    set_stronger_repulsion(bool) {
      this.stronger_repulsion = bool;
    }

    set_spread_probability(bool) {
      this.infection_probability_onContact = bool;
    }


    move_to_r(list_uids, from) {
      var uid;

      for (uid of list_uids) {
        if (from == "s") {
          var agent = this.s_list.filter(function(value, index, arr){ return value.unique_id === uid;})[0];
          // delete
          this.s_list = this.s_list.filter(function(value, index, arr){ return value.unique_id !== uid;});
          // remove agent from world
          this.space.remove_agent(agent);

        } else if (from == "i") {
          var agent = this.i_list.filter(function(value, index, arr){ return value.unique_id === uid;})[0];
          // delete
          this.i_list = this.i_list.filter(function(value, index, arr){ return value.unique_id !== uid;});
          // remove agent from world
          this.space.remove_agent(agent);

        } else {
          console.log("Error switching class to Removed")
        }

        // add new
        var new_agent = new Removed(agent.unique_id, agent.position, this, 
          agent.now_in_center, agent.home);
        
        new_agent.has_infected = agent.has_infected;

        this.r_list.push(new_agent);        
        this.space.add_agent(new_agent, new_agent.home, getRandomInt(1,3));
      }
    }


    move_to_i(list_uids) {
      var uid;

      for (uid of list_uids) {
        var agent = this.s_list.filter(function(value, index, arr){ return value.unique_id === uid;})[0];

        // delete
        this.s_list = this.s_list.filter(function(value, index, arr){ return value.unique_id !== uid;})
        var att = this.space.get_agent_attributes(agent);
        this.space.remove_agent(agent);

        // add new
        var new_agent = new Infected(agent.unique_id, agent.position, this, 
          agent.now_in_center, agent.home, agent.steps_since_infection);
        
        new_agent.has_infected = agent.has_infected;

        this.i_list.push(new_agent);        
        this.space.add_agent(new_agent, new_agent.home, att[0][3]); // infected dont go to work? , getRandomInt(1,2));
      }
    }


    step_s(){
      var to_r = [];
      var to_i = [];

      // iterate over every agent in s_list - apply step
      for (var key in this.s_list) {
        var [add_r, add_i] = this.s_list[key].step(); // if class change -> no move
        if (add_r >= 0) {
          to_r.push(add_r);
        } else if (add_i >= 0) {
          to_i.push(add_i);
        }
      }
      
      // move agents to other class
      if (to_r.length > 0) {
        this.move_to_r(to_r, "s");
      } else if (to_i.length > 0) {
        this.move_to_i(to_i);
      }

      // calculate count
      var healthy = this.s_list.filter(function (el) {
        return !el.infected
      });

      // return for statistics
      return [healthy.length, this.s_list.length - healthy.length] 
    }


    step_i(){
      var to_r = [];

      // iterate over every agent in s_list - apply step
      for (var key in this.i_list) {
        var add_r = this.i_list[key].step();
        if (add_r >= 0) {
          to_r.push(add_r);
        }
      }

      // move agents to other class
      if (to_r.length > 0) {
        this.move_to_r(to_r, "i");
      }

      // return for statistics
      return this.i_list.length
    }

      
    step_r() {

      // iterate over every agent in s_list - apply step
      for (var key in this.r_list) {
        this.r_list[key].step();
      }

      // return for statistics
      return this.r_list.length
    }

    
    calculate_R0(count_susceptible, count_infected, count_removed) {
      // Todo: Basic reproduction number implementieren - https://web.stanford.edu/~jhj1/teachingdocs/Jones-Epidemics050308.pdf, https://wwwnc.cdc.gov/eid/article/25/1/17-1901_article
      // R0 = βN / ν : β effective contact rate, ν removal rate; dr/dt = νi ; i = I/N, ds/dt = −βsi - https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology   

      var R = this.old_R.slice(-this.steps_each_day);
      const sum_R = R.reduce((a, b) => a + b, 0);
      const dRdt = ((this.steps_each_day * count_removed - sum_R) / R.length) || 0;

      var I = this.old_I.slice(-this.steps_each_day);
      const sum_I = I.reduce((a, b) => a + b, 0);
      const dIdt = ((this.steps_each_day * count_infected - sum_I) / I.length) || 0;

      var gamma = (dRdt/count_infected + 0.01);

      this.old_R.push(count_removed);
      this.old_S.push(count_susceptible);
      this.old_I.push(count_infected);

      var R0 = ((dIdt /(gamma*count_infected) + 1) * this.population / count_susceptible);

      if (this.day >= 1) {
        console.log("R0:" + R0);
        return R0
      } else {
        return 0;
      }
      
    }


    calculate_mode() {
      var daily_step = this.step_num % this.steps_each_day;
      var mode;
      if (daily_step <= this.schedule["night"]) {
        mode = "night"
      } else if (daily_step > this.schedule["night"] && daily_step <= this.schedule["morning"]) {
        mode = "morning"
      } else if (daily_step > this.schedule["morning"] && daily_step <= this.schedule["work"]) {
        mode = "work"
      } else if (daily_step > this.schedule["work"] && daily_step <= this.schedule["afterwork"]) {
        mode = "afterwork"
      } else if (daily_step > this.schedule["afterwork"] && daily_step <= this.schedule["evening"]) {
        mode = "evening"
      }

      return mode;
    }


    step() {
      this.space.update_linked_cell(this.repulsion_range);

      // get mode of current step
      this.current_mode = this.calculate_mode();

      // step for each class
      var num_sus = this.step_s()
      var num_inf = this.step_i()
      var num_rem = this.step_r()
      
      var curr_R0 = this.calculate_R0(num_sus[0], (num_inf + num_sus[1]), num_rem);

      console.log("Day: "+ this.day);
      console.log("Mode: "+ this.current_mode);
      console.log("Step - day-cycle: "+ this.step_num % this.steps_each_day);

      // update step count and day
      this.step_num += 1;
      this.day = Math.floor(this.step_num / this.steps_each_day);

      if (num_inf + num_sus[1] == 0) {
        return true;
      } else {
        return false;
      }
    }

    // remove sleep - regelmäßiges aufrufen - step methoden bei aufruf
    // depricated: run via App.js
    async run() {
      this.reset()
      this.initialize()
      for (var i of range(1, this.max_step)) {
        console.log("Step: "+i);
        
         var ret = this.step()
         if (ret) {
          console.log("Reached end of Simulation after "+i+"steps.");
          break
         }

        await Sleep(200);
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {SIR_Model}