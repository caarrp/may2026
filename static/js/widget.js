//for webgl and how calculator is displayed


class webGL_canvas{

    constructor(){

	this.canvas = document.getElementById('webgl-canvas')
        this.canvas.width = 2000;
        this.canvas.height = 2000;
	this.depth = 10;
	this.step = 1;

	//calculator
	this.calculator = new calculator3D();
	this.points_buffer = null;
	this.total_points = 0;
	this.mesh_buffer = null;

        this.gl = this.canvas.getContext('webgl');
	this.errors = [];
	//this.debugger = new WebGLDebugger(this.gl);
        //console.log("\twebGL debugger initialized");

        if (!this.gl) {
            console.error("WebGL not supported!");
            return;
        }

	this.input = "";
	this.dark = false;
	
	//grids
	this.xy_grid_buffer = null;
	this.xz_grid_buffer = null;
	this.yz_grid_buffer = null;

        // then init webGL
        this.init_webGL();
        this.setup_buffers();
        this.setup_shaders();
        this.render();
    }

//UPDATE
    update_graph(){

	if (!this.calculator.is_valid){
	    console.error("Input equation is not valid");
	    //this.showError("Invalid equation. Please check syntax.");
	    return;
	}

	if (this.calculator.vertex_buffer && this.calculator.vertex_buffer.length > 0) {

	    if (this.points_buffer) {
		this.gl.deleteBuffer(this.points_buffer.buffer);
	    }
	    let vertex_buffer = this.calculator.vertex_buffer;
	    
	    // CREATE WebGL buffer (THIS IS THE MISSING STEP)
	    this.points_buffer = this.gl.createBuffer();
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.points_buffer);
	    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertex_buffer, this.gl.STATIC_DRAW);
	    
	    this.total_points = this.calculator.vertex_buffer.length / 3;
	    
	    console.log("\twebGL buffer created with", this.total_points, "points");
	} else {
	    console.warn("\tno vertices to buffer");
	}
	this.render();

    }


//RENDER
    render() {
        //clear screen
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        //draw XZ grid
        if (this.xz_grid_buffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.xz_grid_buffer.buffer);
            this.gl.vertexAttribPointer(this.positionLoc, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.uniform3f(this.colorLoc, 0.5, 0.5, 0.5);//gray grid!
            this.gl.drawArrays(this.gl.LINES, 0, this.xz_grid_buffer.vertexCount);
        }

	//if this.mesh_buffer
	if (this.points_buffer){

	    //console.log('\tbuffer exists:', this.points_buffer);
	    //console.log('\tis webGLBuffer?', this.points_buffer instanceof WebGLBuffer);
	    //const positionLoc = this.gl.getAttribLocation(program, 'a_position');
	    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.points_buffer);

    //const boundBuffer = this.gl.getParameter(this.gl.ARRAY_BUFFER_BINDING);
    //console.log('\tcurrently bound buffer:', boundBuffer === this.points_buffer ? 'MATCH' : 'MISMATCH');

	    this.gl.vertexAttribPointer(this.positionLoc, 3, this.gl.FLOAT, false, 0, 0);
	    this.gl.uniform3f(this.colorLoc, 1.0, 0.0, 0.0); // Red points
	    this.gl.enable(this.gl.PROGRAM_POINT_SIZE);
	    this.gl.drawArrays(this.gl.POINTS, 0, this.total_points);

	}
        requestAnimationFrame(() => this.render());
    }




//INIT
    init_webGL() {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
	if (this.dark){
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
	}       

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }


//SETUP BUFFER
    setup_buffers(){

	this.xy_grid_buffer = this.setup_grid(true, true, false);
	this.xz_grid_buffer = this.setup_grid(true, false, true);
	this.yz_grid_buffer = this.setup_grid(false, true, true);
	//console.log("buffers created:");
    }


//SETUP SHADER
    setup_shaders(){
	//VERTEX SHADER
        const vsSource = `
            attribute vec3 aPosition;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uViewMatrix;
            void main() {
		gl_PointSize = 15.0;
                gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
            }
        `;

	//FRAGMENT SHADER
        const fsSource = `
            precision mediump float;
            uniform vec3 uColor;
            void main() {
                gl_FragColor = vec4(uColor, 1.0);
            }
        `;

        // Compile vertex shader
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, vsSource);
        this.gl.compileShader(vertexShader);
        
        // Compile fragment shader
        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, fsSource);
        this.gl.compileShader(fragmentShader);
        
        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        
        // Get locations
        this.positionLoc = this.gl.getAttribLocation(this.program, 'aPosition');
        this.projectionLoc = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
        this.viewLoc = this.gl.getUniformLocation(this.program, 'uViewMatrix');
        this.colorLoc = this.gl.getUniformLocation(this.program, 'uColor');
        
        this.gl.enableVertexAttribArray(this.positionLoc);
        
        // Create isometric projection matrix (120-degree angle)
        const aspect = this.canvas.width / this.canvas.height;
        this.projectionMatrix = this.create_isometric(aspect);
        this.gl.uniformMatrix4fv(this.projectionLoc, false, this.projectionMatrix);
        
        // Create view matrix for isometric view (looking at origin from 120° angle)
        this.viewMatrix = this.create_isometric_view();
        this.gl.uniformMatrix4fv(this.viewLoc, false, this.viewMatrix);
    }

   create_isometric(aspect) {
        // Orthographic projection for isometric look
        const left = -10;
        const right = 10;
        const bottom = -10 / aspect;
        const top = 10 / aspect;
        const near = 0.1;
        const far = 100;
        
        return new Float32Array([
            2/(right-left), 0, 0, 0,
            0, 2/(top-bottom), 0, 0,
            0, 0, -2/(far-near), 0,
            -(right+left)/(right-left), -(top+bottom)/(top-bottom), -(far+near)/(far-near), 1
        ]);
    }
    
    create_isometric_view() {
        // Camera position for classic isometric view (120° between axes)
        // Position at 45° rotation and 35.264° pitch (true isometric)
        const angle = 45 * Math.PI / 180;  // Rotate 45 degrees around Y
        const pitch = 35.264 * Math.PI / 180;  // Arcsin(tan(30°)) ≈ 35.264°
        
        const distance = 15;
        const x = Math.sin(angle) * distance * Math.cos(pitch);
        const y = Math.sin(pitch) * distance;
        const z = Math.cos(angle) * distance * Math.cos(pitch);
        
        // Look-at matrix (camera at (x,y,z), looking at origin, up is Y axis)
        const eye = [x, y, z];
        const center = [0, 0, 0];
        const up = [0, 1, 0];
        
        // Calculate view matrix
        const f = this.normalize([center[0]-eye[0], center[1]-eye[1], center[2]-eye[2]]);
        const s = this.normalize(this.cross(f, up));
        const u = this.cross(s, f);
        
        return new Float32Array([
            s[0], u[0], -f[0], 0,
            s[1], u[1], -f[1], 0,
            s[2], u[2], -f[2], 0,
            -this.dot(s, eye), -this.dot(u, eye), this.dot(f, eye), 1
        ]);
    }
    
    //maths
    normalize(v) {
        const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        return [v[0]/len, v[1]/len, v[2]/len];
    }
    


    cross(a, b) {
        return [
            a[1]*b[2] - a[2]*b[1],
            a[2]*b[0] - a[0]*b[2],
            a[0]*b[1] - a[1]*b[0]
        ];
    }
    


    dot(a, b) {
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    }


setup_grid(x_enabled, y_enabled, z_enabled) {
    const depth = this.depth;
    const step = this.step;
    const vertices = [];
    
    //XZ
    if (x_enabled && z_enabled && !y_enabled) {
        for (let z = -depth; z <= depth; z += step) {
            vertices.push(-depth, 0, z);
            vertices.push(depth, 0, z);
        }
        
        for (let x = -depth; x <= depth; x += step) {
            vertices.push(x, 0, -depth);
            vertices.push(x, 0, depth);
        }
    }
    
    //XY
    else if (x_enabled && y_enabled && !z_enabled) {
        for (let y = -depth; y <= depth; y += step) {
            vertices.push(-depth, y, 0);
            vertices.push(depth, y, 0);
        }
        
        for (let x = -depth; x <= depth; x += step) {
            vertices.push(x, -depth, 0);
            vertices.push(x, depth, 0);
        }
    }
    
    //YZ 
    else if (y_enabled && z_enabled && !x_enabled) {
        for (let z = -depth; z <= depth; z += step) {
            vertices.push(0, -depth, z);
            vertices.push(0, depth, z);
        }
        
        for (let y = -depth; y <= depth; y += step) {
            vertices.push(0, y, -depth);
            vertices.push(0, y, depth);
        }
    }
    
    //console.log("grid vertices created:", vertices.length / 3);
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    
    return {
        buffer: buffer,
        vertexCount: vertices.length / 3
	};
    }

}
