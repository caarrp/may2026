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
	
	this.resolution = 50;
	this.depth = 10;//depth of webgl space, [-10. 10]

	this.func = null;
        this.variable_order = ['x', 'y', 'z'];
	this.is_implicit = false;
	//assumes initally is an explicit surface

	//for explicit functions
	this.z_form = "";
    }

    interpret_function(){
	console.log("in interpret_function");	
	
	if (!this.list_input || this.list_input.length === 0) {
	    console.error("\tnope");
	    return null;
	}

	const expr = this.list_input.join('');

    }


//IMPLICIT CHECK
    implicit_check(list, equal_index){
	let implicit = false;

	let left_side = list.slice(0, equal_index);
	let right_side = list.slice(equal_index + 1);
	
	let leftHasVars = left_side.some(token => token == "x" || token == "y" || token == "z");
	let rightHasVars = right_side.some(token => token == "x" || token == "y" || token == "z");
	
	let leftIsJustZ = (left_side.length === 1 && left_side[0] === "z");
	let rightIsJustZ = (right_side.length === 1 && right_side[0] === "z");
	
	let rightIsConstant = !rightHasVars && right_side.length > 0;
	let leftIsConstant = !leftHasVars && left_side.length > 0;
	
	//condition 1: Variables on BOTH sides AND it's not "z = something"
	if (leftHasVars && rightHasVars && !leftIsJustZ && !rightIsJustZ) {
	    implicit = true;
	    console.log("\tImplicit: variables on both sides");
	}
	
	//condition 2: Variables on one side, constant on the other (e.g., x^2+y^2+z^2 = 25)
	else if ((leftHasVars && rightIsConstant) || (rightHasVars && leftIsConstant)) {
	    implicit = true;
	    console.log("\tImplicit: variables = constant");
	}
	
	//condition 3: Variables on one side, expression on other that's not solved for z
	else if ((leftHasVars && !rightIsJustZ) || (rightHasVars && !leftIsJustZ)) {
	    implicit = true;
	    console.log("\tImplicit: not solved for a single variable");
	}
	
	if (!implicit) {
	    console.log("\tNot implicit (likely explicit or expression)");
	}
	
	this.is_implicit = implicit;
    }



//CONVERT FUNCTION
    convert_function(list, bool, equal_index){
	console.log("in convert_function");	
	let z_exp = "";

	let left_side = list.slice(0, equal_index);
	let right_side = list.slice(equal_index + 1);

	let left_z = (left_side.length === 1 && 
		(left_side[0] === "z" || left_side[0] === "f" || left_side[0] === "g" || left_side[0] === "h"));
	let right_z = (right_side.length === 1 && 
	    (right_side[0] === "z" || right_side[0] === "f" || right_side[0] === "g" || right_side[0] === "h" ));
        
        if (left_z) {
            this.z_form = `z=${right_side.join('')}`;
            this.equation_type = "explicit_z";
            console.log(`\tAlready in z= form: ${this.z_form_eqn}`);
            
        } else if (right_z) {
            this.z_form = `z=${left_side.join('')}`;
            this.equation_type = "explicit_z_reversed";
            console.log(`\tReversed to z= form: ${this.z_form_eqn}`);
            
        } else {

	    this.is_implicit = true;
            // Implicit equation (both sides have variables)
            // Example: "x^2 + y^2 = z^2" → solve for z
            // For now, store as is and mark as implicit
            this.implicit_eqn = `${left_side.join('')}=${right_side.join('')}`;
            this.equation_type = "implicit";
            console.log(`\tImplicit equation (cannot convert to z= directly): ${this.implicit_eqn}`);
	}
    }




//PARSE FUNCTION
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
		    let last_token = null;
		    let valid = true;
		    let errors = [];
		    let equal_index = -1;

		    for (let i = 0; i < list.length; i++) {
			let token = list[i];
			
			if (token == "=") {
			    bool = true;
			}

			if (token == "=") {
			    bool = true;
			    equal_index = i;
			    if (parenthesis != 0){
				valid = false;
				break;
			    }
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
			    if (last_token && (last_token == "+" || last_token == "-" || last_token == "*" || last_token == "/" || last_token == "^")) {
				valid = false;
				errors.push(`Consecutive operators '${last_token}${token}'`);
			    }
			}
			
			if (token.match(/^\d+\.?\d*$/)) {
			    // is a number - should i come back to this?
			}
			
			last_token = token;
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
			this.convert_function(list, bool, equal_index);
			this.list_input = list;
		    } else {
			console.log("\tfunction is invalid:");
			errors.forEach(err => console.log(`  - ${err}`));
			this.errors = errors;
		    }
		    
		} else {
		    this.is_valid = false;
		    console.log("\tfunction is invalid:");
		}
	    
		//this.implicit_check(list, equal_index);
	    }//end has list
    
	}//end has input
    }

    set_function(eqn){
	this.input = eqn;
	this.parse_function();
	this.interpret_function();
    }


}

