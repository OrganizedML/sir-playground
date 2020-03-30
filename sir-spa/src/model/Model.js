

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
        
      // todo
      this.space = new Space();
    }

    reset() {
      // delete all old data
    }

    initialize() {
      // setup 3 lists + 
      // setup parameters + 
      // create agents +
      // add agents to lists
    }

    step() {
      // iterate over every agent +
      // call the step function for every agent + save class changes +
      // apply class changes +
      // print canvas +
      // set current statistics as info for dashboard
    }

    async run() {
      this.reset()
      this.initialize()
      for (var i of range(1, this.max_step)) {
        console.log("step"+i);
        this.step()
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