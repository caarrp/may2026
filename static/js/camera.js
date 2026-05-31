//for camera in widget

class Camera {
    constructor() {
        this.radius = 15;      // Distance from center
        this.theta = 45 * Math.PI / 180;  // Horizontal angle (rotation around Y)
        this.phi = 35.264 * Math.PI / 180; // Vertical angle (pitch)
        this.target = [0, 0, 0];  // Looking at origin
        
        // Control flags
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Rotation speed
        this.rotateSpeed = 0.01;
        this.zoomSpeed = 0.1;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('wheel', (e) => this.onWheel(e));
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        // Rotate horizontally (around Y axis)
        this.theta += deltaX * this.rotateSpeed;
        
        // Rotate vertically (limited to avoid flipping)
        this.phi += deltaY * this.rotateSpeed;
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onWheel(e) {
        // Zoom in/out
        this.radius -= e.deltaY * this.zoomSpeed;
        this.radius = Math.max(3, Math.min(30, this.radius));  // Clamp distance
    }
    
    getViewMatrix() {
        // Calculate camera position in spherical coordinates
        const x = this.radius * Math.sin(this.theta) * Math.cos(this.phi);
        const y = this.radius * Math.sin(this.phi);
        const z = this.radius * Math.cos(this.theta) * Math.cos(this.phi);
        
        const eye = [x, y, z];
        const center = this.target;
        const up = [0, 1, 0];
        
        // Create look-at matrix
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
    
    // Helper math functions
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
    
    // Reset to default view
    reset() {
        this.radius = 15;
        this.theta = 45 * Math.PI / 180;
        this.phi = 35.264 * Math.PI / 180;
        this.target = [0, 0, 0];
    }
}
