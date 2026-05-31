//for calculator that writes points and mesh 


class calculator3D{


    constructor(){

	console.log("in calculator constructor");
	
	this.is_valid = true;
	this.errors = [];
	this.input = "";
	this.list_input = [];

	this.vertices = null;
	this.facets = null;

	this.vertex_buffer = null;
	this.normal_buffer = null;
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
	this.jsmath_z_form = "";

	//for implicit functions
	//this.
    }



//IMPLICIT 




//INTERPRET FUNCTION
    interpret_function(){
	console.log("in interpret_function");	
	
	if (!this.list_input || this.list_input.length === 0) {
	    console.error("\tnope");
	    return null;
	}
	
	if (this.is_implicit){
	    console.log("\timplicit case or other:");
	    //check if is a quadradic
	    this.classify_quadratic();


	    const expr = this.list_input.join('');


	}else{
	    console.log("\texplicit case:");
	    this.explicit_map();
	}

	//this.get_vertices();
	//this.get_normals();

	//if (this.facets){
	//    this.get_facets();
	//}
    }


//CLASSIFY QUADRATIC
    classify_quadratic(){
	let expr = this.list;
	let has_x2 = false, has_y2 = false, has_z2 = false;
	let has_xy = false, has_xz = false, has_yz = false;
	let has_x = false, has_y = false, has_z = false;

	


    }







//EXPLICIT MAP
    explicit_map(){
	let expr = this.z_form;
	let math_expr = this.jsmath_z_form;
	//looks like x+1
	let func;
	
	let h = 0.0001;
	let df_dx_func = new Function('x', 'y', 
	    `return (${math_expr.replace(/x/g, `(x+${h})`)} - ${math_expr.replace(/x/g, `(x-${h})`)}) / (2*${h});`
	);
	//for calculating gradient (normals)
	let df_dy_func = new Function('x', 'y',  // Fixed: added df_dy_func
	    `return (${math_expr.replace(/y/g, `(y+${h})`)} - ${math_expr.replace(/y/g, `(y-${h})`)}) / (2*${h});`
	);

	try {
	    func = new Function('x', 'y', `return ${math_expr};`);
	    console.log(`\tFunction compiled: z = ${math_expr}`);
	} catch(e) {
	    console.error(`\tFailed to compile function: ${e}`);
	    return null;
	}
	let neg_gepth = -this.depth;

	let depth = this.depth || 10;  // Default depth if not set
	let x_min = -depth;
	let x_max = depth;
	let y_min = -depth;
	let y_max = depth;
	let res = this.resolution;
	
	let step_x = (x_max - x_min) / res;
	let step_y = (y_max - y_min) / res;
	
	let vertices = [];  
	let normals = [];  
	//let points = [];        //point cloud ( which can be same as vertices)
	let faces = [];

	let vertex = [];
	let normal = [];

	console.log(`\tgenerating ${(res+1)*(res+1)} points...`);

	for (let i = 0; i <= res; i++) {
	    let x = x_min + i * step_x;

	    for (let j = 0; j <= res; j++) {
		let y = y_min + j * step_y;

		try {
		    let z = func(x, y);
		    
		    //first check if z is valid
		    if (isNaN(z) || !isFinite(z)) {
			console.warn(`\tinvalid point at (${x.toFixed(2)}, ${y.toFixed(2)}): z = ${z}`);
			continue;
		    }

		    let df_dx = df_dx_func(x, y);
		    let df_dy = df_dy_func(x, y);
		    let nx = -df_dx;
		    let ny = -df_dy;
		    let nz = 1;//for normals
		
		    let len = Math.sqrt(nx*nx + ny*ny + nz*nz);
		    if (len > 0) {
			nx /= len;
			ny /= len;
			nz /= len;
		    }

		    let point = {
			x: x,
			y: y,
			z: z,
			index: vertices.length
		    };
		    vertices.push(point);
		    vertex.push(x, z, y);
		    //points.push(point);
		    normals.push({x: nx, y: ny, z: nz});
		    normal.push(nx, nz, ny);

		} catch(e) {
		    console.warn(`\terror at (${x.toFixed(2)}, ${y.toFixed(2)}): ${e.message}`);
		}
	    }
	}
	console.log(`\tgenerated ${vertices.length} valid points`)
	this.vertices = vertices;
	this.normals = normals;

	this.vertex_buffer = new Float32Array(vertex);
	this.normal_buffer = new Float32Array(normal);

    }







//CONVERT FUNCTION
    convert_zfunction(list, bool, equal_index){
	console.log("in convert_function");	
	let z_exp = "";

	let left_side = list.slice(0, equal_index);
	console.log("\tleft_side is " + left_side);
	let right_side = list.slice(equal_index + 1, list.length);
	console.log("\tright_side is " + right_side);

	let left_z = (left_side.length === 1 && 
		(left_side[0] === "z" || left_side[0] === "f" || left_side[0] === "g" || left_side[0] === "h"));
	let right_z = (right_side.length === 1 && 
	    (right_side[0] === "z" || right_side[0] === "f" || right_side[0] === "g" || right_side[0] === "h" ));
        
        if (left_z) {
            this.z_form = `${right_side.join('')}`;
            this.equation_type = "explicit_z";
            console.log(`\tAlready in z= form: ${this.z_form_eqn}`);
            
        } else if (right_z) {
            this.z_form = `${left_side.join('')}`;
            this.equation_type = "explicit_z_reversed";
            console.log(`\tReversed to z= form: ${this.z_form_eqn}`);
            
        } else {

	    this.is_implicit = true;
            // Implicit equation (both sides have variables)
            // Example: "x^2 + y^2 = z^2" → solve for z
            // For now, store as is and mark as implicit
            this.implicit_eqn = `${left_side.join('')}=${right_side.join('')}`;
            console.log(`\tImplicit equation (cannot convert to z= directly): ${this.implicit_eqn}`);
	}
    }



    carrot(list) {
	console.log("in carrot");
	if (list == null) return list;
	
	let result = [];
	let math_result = [];
	
	for (let i = 0; i < list.length; i++) {
	    let token = list[i];
	    
	    if (token == "^") {
		let left = result[result.length - 1];
		let left_math = math_result[result.length - 1];
		let right = list[i + 1];
		
		if (left && right) {
		    math_result.pop(); 
		    result.push(token);
		    result.push(list[i+1]);//TODO fix later
		    
		    let expNum = parseFloat(right);
		    
		    if (!isNaN(expNum) && Number.isInteger(expNum) && expNum > 0) {
			let multiplicationChain = [];
			for (let j = 0; j < expNum; j++) {
			    multiplicationChain.push(left);
			    if (j < expNum - 1) {
				multiplicationChain.push("*");
			    }
			}
			math_result.push(...multiplicationChain);
		    } else {
			math_result.push(`Math.pow(${left}, ${right})`);
		    }
		    i++; 
		}
	    } 
	    //enhanced carrot also handles math functions
	    else if (token === "sin" || token === "cos" || token === "tan") {
		result.push(token);
		math_result.push(`Math.${token}`);
	    }
	    else if (token === "ln") {
		result.push(token);
		math_result.push("Math.log");
	    }
	    else if (token === "log") {
		result.push(token);
		math_result.push("Math.log10");
	    }
	    else if (token === "exp") {
		result.push(token);
		math_result.push("Math.exp");
	    }
	    else if (token === "sqrt") {
		result.push(token);
		math_result.push("Math.sqrt");
	    }
	    else if (token === "abs") {
		result.push(token);
		math_result.push("Math.abs");
	    }
	    // Handle constant e
	    else if (token === "e") {
		result.push(token);
		result.push("Math.E");
	    }
	    // Handle pi
	    else if (token === "pi" || token === "π") {
		result.push(token);
		math_result.push("Math.PI");
	    }
	    else {
		math_result.push(token);
		result.push(token);
	    }
	}//end for loop
	
	let math_str = math_result.join('');
	math_str = math_str.replace("z", "");
	math_str = math_str.replace("=", "");
	this.jsmath_z_form = math_str;
	console.log("\tmath z form : " + this.jsmath_z_form);
	console.log("\tz form : " + result);
	return result;
    }



//PARSE FUNCTION
    parse_function(){
	console.log("in parse_function");

	    if (this.input != "") {
		console.log("\tinput is " + this.input);
		let list =
		    this.input.match(/(\d+\.?\d*|\+|\-|\*|\/|\^|x|y|f|g|e|cos|abs|exp|tan|sqrt|sin|log|ln|h|z|\(|\)|=)/g);
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
			    equal_index = i;
			    if (parentheses != 0){
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
			let new_list = this.carrot(list);
			this.convert_zfunction(new_list, bool, equal_index);

			console.log( "\tnew list is " + new_list);
			this.list_input = new_list;
		    } else {
			console.log("\tfunction is invalid:");
			errors.forEach(err => console.log(`  - ${err}`));
			this.errors = errors;
		    }
		    
		} else {
		    this.is_valid = false;
		    console.log("\tfunction is invalid:");
		}//end has/not has list
	    
		//this.implicit_check(list, equal_index);
	    }///end has input
    
    }
    

    set_function(eqn){
	this.input = eqn;
	this.parse_function();
	this.interpret_function();

    }


}

