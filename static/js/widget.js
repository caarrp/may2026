//for webgl and how calculator is displayed


class webGL_canvas{

    constructor(){

	this.canvas = document.getElementById('webgl-canvas')
        this.canvas.width = window.innerWidth / 2;
        this.canvas.height = window.innerHeight / 2;

	this.calculator = new 3D_calculator();
        this.gl = this.canvas.getContext('webgl');

        if (!this.gl) {
            console.error("WebGL not supported!");
            return;
        }

	this.input = "";
	this.dark;

	this.xy_grid_buffer = null;
	this.xz_grid_buffer = null;
	this.yz_grid_buffer = null;

        // then init webGL
        this.init_webGL();
        this.setup_buffers();
        this.setup_shaders();
        this.render();
    }

    init_webGL() {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
	if (this.dark){
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
	}       

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    setup_grid(x, y, z){
	
	const depth = 10;
	const step = 1; //come back for subdivisions
	const divisions = depth / step;

	const vertices = [];
	
	for (let i = 0; i <= divisions; i++) {
            const z = -depth + (i * step);
            vertices.push(-depth, 0, z);  // Start point
            vertices.push(depth, 0, z);   // End point
        } 

    }

    setup_buffers(){

	this.xy_grid_buffer = this.setup_grid(true, true, false);
	this.xz_grid_buffer = this.setup_grid(true, false, true);
	this.yz_grid_buffer = this.setup_grid(false, true, true);
	
	console.log("Buffers created:", {
	    xy: this.xy_grid_buffer.vertexCount,
	    xz: this.xz_grid_buffer.vertexCount,
	    yz: this.yz_grid_buffer.vertexCount
	});
    }

    setup_shaders(){

    }



setup_grid(x_enabled, y_enabled, z_enabled) {
    const depth = 10;
    const step = 1; 
    const divisions = depth / step;
    const vertices = [];

    if (x_enabled && z_enabled && !y_enabled) {
        for (let i = 0; i <= divisions; i++) {
            const z = -depth + (i * step);
            vertices.push(-depth, 0, z);
            vertices.push(depth, 0, z); 
        }
        
        for (let i = 0; i <= divisions; i++) {
            const x = -depth + (i * step);
            vertices.push(x, 0, -depth);
            vertices.push(x, 0, depth); 
        }
    } 
    else if (x_enabled && y_enabled && !z_enabled) {
        for (let i = 0; i <= divisions; i++) {
            const y = -depth + (i * step);
            vertices.push(-depth, y, 0);
            vertices.push(depth, y, 0);
        }
        
        for (let i = 0; i <= divisions; i++) {
            const x = -depth + (i * step);
            vertices.push(x, -depth, 0);
            vertices.push(x, depth, 0);
        }
    }
    else if (y_enabled && z_enabled && !x_enabled) {
        for (let i = 0; i <= divisions; i++) {
            const z = -depth + (i * step);
            vertices.push(0, -depth, z); 
            vertices.push(0, depth, z); 
        }
        
        for (let i = 0; i <= divisions; i++) {
            const y = -depth + (i * step);
            vertices.push(0, y, -depth);
            vertices.push(0, y, depth);
        }
    }
    else if (x_enabled && y_enabled && z_enabled) {
        for (let i = 0; i <= divisions; i++) {
            const z = -depth + (i * step);
            vertices.push(-depth, 0, z);
            vertices.push(depth, 0, z);
            const x = -depth + (i * step);
            vertices.push(x, 0, -depth);
            vertices.push(x, 0, depth);
        }
        
        for (let i = 0; i <= divisions; i++) {
            const y = -depth + (i * step);
            vertices.push(-depth, y, 0);
            vertices.push(depth, y, 0);
            const x = -depth + (i * step);
            vertices.push(x, -depth, 0);
            vertices.push(x, depth, 0);
        }
        
        for (let i = 0; i <= divisions; i++) {
            const z = -depth + (i * step);
            vertices.push(0, -depth, z);
            vertices.push(0, depth, z);
            const y = -depth + (i * step);
            vertices.push(0, y, -depth);
            vertices.push(0, y, depth);
        }
    }


}
