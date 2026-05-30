//for calculator that writes points and mesh 


class calculator3D{


    constructor(){

	console.log("in calculator constructor");
	
	this.is_valid = true;
	this.errors = [];
	this.input = "";
	this.list_input = [];


	this.vertex_buffer = null;
	this.edge_buffer = null; 
	this.mesh_buffer = null;

    }

    interpret_function(){
	


    }

    parse_function(){
	console.log("in parse_function");
	if (this.input != ""){
	    console.log("\tinput is " + this.input);
	    let list = this.input.match(/(\d+\.?\d*|\+|\-|\*|\/|\^|x|y|f|g|h|z|\(|\))/g);
	    console.log("\tparsed input is " + list);

	    if (this.input != "") {
		console.log("\tinput is " + this.input);
		let list = this.input.match(/(\d+\.?\d*|\+|\-|\*|\/|\^|x|y|f|g|h|z|\(|\))/g);
		console.log("\tparsed input is " + list);

		if (list != null) {
		    let bool = false;  //detects "="
		    let variables = 0;
		    let parentheses = 0;  //tracks parens
		    let lastToken = null;
		    let valid = true;
		    let errors = [];

		    for (let i = 0; i < list.length; i++) {
			let token = list[i];
			
			if (token == "=") {
			    bool = true;
			}
			
			if (token == "x" || token == "y" || token == "z") {
			    variables++;
			}
			
			if (token == "(") {
			    parentheses++;
			}
			else if (token == ")") {
			    parentheses--;
			    if (parentheses < 0) {
				valid = false;
				errors.push("Too many closing parentheses ')'");
			    }
			}
			
			let isOperator = (token == "+" || token == "-" || token == "*" || token == "/" || token == "^");
			if (isOperator) {
			    if (i == 0) {
				valid = false;
				errors.push(`Expression cannot start with operator '${token}'`);
			    }
			    if (i == list.length - 1) {
				valid = false;
				errors.push(`Expression cannot end with operator '${token}'`);
			    }
			    if (lastToken && (lastToken == "+" || lastToken == "-" || lastToken == "*" || lastToken == "/" || lastToken == "^")) {
				valid = false;
				errors.push(`Consecutive operators '${lastToken}${token}'`);
			    }
			}
			
			if (token.match(/^\d+\.?\d*$/)) {
			    // is a number - should i come back to this?
			}
			
			lastToken = token;
		    }

		    if (parentheses != 0) {
			valid = false;
			errors.push(`Unbalanced parentheses: ${parentheses} unclosed '('`);
		    }

		    if (variables == 0 && !bool) {
			errors.push("Expression must contain at least one variable (x, y, or z)");
		    }

		    if (valid) {
			console.log( "\tfunction is valid");
			console.log("\tvariables found: ${variables}");
		    } else {
			console.log("\tfunction is invalid:");
			errors.forEach(err => console.log(`  - ${err}`));
			this.errors = errors;
		    }
		    
		} else {
		    this.is_valid = false;
		    console.log("\tfunction is invalid:");
		}
	    }//end has list
    
	}//end has input
    }

    set_function(eqn){
	this.input = eqn;
	this.parse_function();
	this.interpret_function();
    }


}

