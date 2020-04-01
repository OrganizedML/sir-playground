import { SIR_Model } from "model/Model"

class Dummy {
    constructor(height, width) {
      this.height = height;
      this.width = width;
    }

    doSomething () {
        let model = new SIR_Model(200, 1, 1, 0.1, 3, 0.8, 15);
        console.log("Starting Model loop");
        model.run();
    }

}

export {Dummy}