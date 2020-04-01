import { SIR_Model } from "model/Model"

class Dummy {
    constructor(height, width) {
      this.height = height;
      this.width = width;
    }

    doSomething () {
        let model = new SIR_Model(1000, 3, 1, 0.05, 8, 0.9, 200);
        console.log("Starting Model loop");
        model.run();
    }

}

export {Dummy}