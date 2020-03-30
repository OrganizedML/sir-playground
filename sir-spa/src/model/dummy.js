class Dummy {
    constructor(height, width) {
      this.height = height;
      this.width = width;
    }

    doSomething () {
        console.log("aaaa")
    }

}

export {Dummy}

$(document).ready(function(){
    var width;
    var height;
    var grid = [];
    var ctx;
    var alive;
    var intervalId;
    var cycle;
    
    function checkNeighbors(i, j, xMax, yMax, isLive){
      
      var neighborCount = 0;
      
      // Any dead cell w/ exactly 3 live neighbors lives
      if ((neighborCount == 3) && (isLive == 0)){
        return 1;
      }
      
      else {
        return 0;
      }
  
    }
  
    function Cell(i, j, r, alive){
      ctx.beginPath();
      ctx.arc(i, j, r, 0, 2*Math.PI);
      ctx.strokeStyle = "#666";
      ctx.stroke();
      if (alive){
        ctx.fillStyle = "#ffcc00";
        ctx.fill();
      }
    }
    
    function setupGame(xMax, yMax, r, n){
      ctx.clearRect(0, 0, width, height);
      for (var y = 0; y < yMax; y++){
        for (var x = 0; x < xMax; x++){
          alive = Math.floor(Math.random()*3);
          alive = Math.floor(alive/2);
          Cell(x*n+n/2, y*n+n/2, r, alive);
          grid.push(alive);
        }
      }
      cycle++;
    }
    
    function printGrid(grid, xMax, yMax){
      var printed = "";
      for (var i = 0; i < grid.length; i++){
        printed += grid[i];
        if (i%yMax == 0 && i != 0){
          printed += "<br>";
        }
      }
      $("#printed").html(printed);
    }
  
    
    function playGame(xMax, yMax, r, n){
      ctx.clearRect(0, 0, width, height);
      var gridCopy = [];
      for (var y = 0; y < yMax; y++){
        for (var x = 0; x < xMax; x++){
          gridCopy[x+y*xMax] = checkNeighbors(x, y, xMax, yMax, grid[x+y*xMax]);
          /*Cell(x*n+n/2, y*n+n/2, r, gridCopy[x+y*xMax]);*/
        }
      }
      grid = gridCopy.slice(0);
      for (var y = 0; y < yMax; y++){
        for (var x = 0; x < xMax; x++){
          Cell(x*n+n/2, y*n+n/2, r, grid[x+y*xMax]);
        }
      }
      cycle++;
      $("#cycle").text(cycle);
    }
    
    function init(){
      ctx = $("#canvas")[0].getContext('2d');
      height = $("#canvas").width();
      width = $("#canvas").height();
      
      // These values are the most aesthetically pleasing
      var xMax = 75;
      var yMax = 75;
      var n = 6.65;
      var r = 2;
  
      cycle = 0;
      setupGame(xMax, yMax, r, n);
      intervalId = setInterval(function() {playGame(xMax, yMax, r, n)}, 75);
    }
    
    init();
  });