class Model {
    constructor(population, 
        initial_infected, 
        infection_radius,
        infection_probability_onContact,
        duration_mean,
        infection_recoginition_probability
        ) {
      this.population = population;
      this.initial_infected = initial_infected;
      this.infection_radius = infection_radius;
      this.infection_probability_onContact = infection_probability_onContact;
      this.duration_mean = duration_mean;
      this.infection_recoginition_probability = infection_recoginition_probability;
    }

  }