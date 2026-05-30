//for calculator that writes points and mesh 


class calculator3D{


    constructor(){

	console.log("in calculator constructor");

	this.input = "";
	this.vertex_buffer = null;
	this.edge_buffer = null; 
	this.mesh_buffer = null;

    }

    parse_function(){
	console.log("in parse_function");
	if (this.input != ""){
	    console.log("\tinput is " + this.input);

	}
    }

    set_function(eqn){
	this.input = eqn;
	this.parse_function();
    }


}

