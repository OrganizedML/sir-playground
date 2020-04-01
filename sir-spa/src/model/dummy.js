import { SIR_Model } from "model/Model"

class Dummy {
    constructor(height, width) {
      this.height = height;
      this.width = width;
    }

    doSomething () {
        let model = new SIR_Model(100, 1, 2, 0.3, 10, 0.8, 50);
        console.log("Starting Model loop");
        model.run();
    }

}

export {Dummy}