import React, { useEffect } from 'react';
import { Dummy } from "model/dummy"

function App() {
  useEffect(() => {
    let dummy = new Dummy(800, 600)
    dummy.doSomething() 
  })

  return (
    <div className="App">
      
    </div>
  );
}

export default App;
