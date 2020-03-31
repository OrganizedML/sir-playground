

class Agent{
    constructor(unique_id, position, model, now_in_center=false,
        last_pos=undefined){
            this.unique_id = unique_id;
            this.position = position;
            this.now_in_center = now_in_center;
            this.model = model;
            this.last_pos = last_pos;

            this.space = model.space;
            this.x = undefined;
            this.y = undefined;
        }
    
    // movement
    move() {
        if (this.model.movement == "random"){
            var next_moves = this.space.get_neighborhood_empty(this.position);
            var next_move = random_choice(next_moves);

        } else if (this.model.movement == "center") {
            // todo
        }

        // wer verwaltete die sichtbaren moves? - Space?
        // this.space.move_agent(self, next_move) - nicht gebraucht?
        this.position = next_move;
        this.space.move_agent(this, next_move);
    }
}

function random_choice(moves) {
    var move = moves[Math.floor(Math.random() * moves.length)];
    return move
}

export {Agent}