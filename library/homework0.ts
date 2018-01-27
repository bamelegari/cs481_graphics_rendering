//import fs = require('fs');

class StaticVertexBufferObject {
    public buffer: WebGLBuffer | null = null;
    private gl: WebGLRenderingContext | null = null;
    private bufferLength: number = 0;
    private count: number = 0;
    constructor(gl: WebGLRenderingContext, private drawArraysMode: number, vertexData: Float32Array) {
        this.buffer = gl.createBuffer();
        if (!this.buffer)
            return;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        this.bufferLength = vertexData.length * 4;
        this.count = vertexData.length / 4;
        this.gl = gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    Render(vertexLoc: number): void {
        if (!this.buffer || !this.gl || vertexLoc < 0)
            return;
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(vertexLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexLoc);
        gl.drawArrays(this.drawArraysMode, 0, this.count);
        gl.disableVertexAttribArray(vertexLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

class ShaderProgram {
    private program_: WebGLProgram | null = null;
    constructor(private gl: WebGLRenderingContext, public vertShaderSource: string, public fragShaderSource: string) {
        let vshader = this.createShader(gl.VERTEX_SHADER, vertShaderSource);
        let fshader = this.createShader(gl.FRAGMENT_SHADER, fragShaderSource);
        if (!vshader || !fshader)
            return;
        this.program_ = gl.createProgram();
        if (!this.program_)
            return;
        gl.attachShader(this.program_, vshader);
        gl.attachShader(this.program_, fshader);
        gl.linkProgram(this.program_);
        if (!gl.getProgramParameter(this.program_, gl.LINK_STATUS)) {
            console.error("Program Link Error")
            console.error(this.gl.getProgramInfoLog(this.program_));
            gl.deleteShader(vshader);
            gl.deleteShader(fshader);
            gl.deleteProgram(this.program_);
            this.program_ = null;
            return;
        }
    }

    Use(): void {
        if (!this.program_)
            return;
        this.gl.useProgram(this.program_);
    }

    GetVertexPosition(vertexName: string): number {
        return this.gl.getAttribLocation(this.program_, vertexName);
    }

    private createShader(type: number, sourceCode: string): WebGLShader | null {
        let shader = this.gl.createShader(type);
        if (!shader)
            return null;
        this.gl.shaderSource(shader, sourceCode);
        this.gl.compileShader(shader);
        let status = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!status) {
            if (type == this.gl.VERTEX_SHADER) console.error("Vertex shader compile error");
            if (type == this.gl.FRAGMENT_SHADER) console.error("Fragment shader compile error");
            console.error(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
}


class homework0 {
	private divElement_: HTMLDivElement | null = null;
    private canvasElement_: HTMLCanvasElement | null = null;
    private gl: WebGLRenderingContext | null = null;
    private vbo: StaticVertexBufferObject | null = null;
    private program: ShaderProgram | null = null;

    constructor(public width: number = 512, public height: number = 384) {
        this.divElement_ = document.createElement("div");
        this.canvasElement_ = document.createElement("canvas");
        if (this.canvasElement_) {
            this.gl = this.canvasElement_.getContext("webgl");
            if (!this.gl) {
                this.gl = this.canvasElement_.getContext("experimental-webgl");
            }
            if (!this.gl) {
                this.canvasElement_ = null;
                this.divElement_.innerText = "WebGL not supported.";
            }
            else {
                this.divElement_.appendChild(this.canvasElement_);
                this.divElement_.align = "center";
            }
        }
        document.body.appendChild(this.divElement_);
    }

    run(): void {
    if (!this.gl) return;
    this.init(this.gl);
    this.mainloop(0);
    }

    mainloop(timestamp: number): void {
        let self = this;
        this.display(timestamp / 1000.0);
        window.requestAnimationFrame((t: number) => {
            self.mainloop(t);
        });
    }

    init(gl: WebGLRenderingContext): void {
        this.vbo = new StaticVertexBufferObject(gl, gl.TRIANGLES, new Float32Array([
            -1, -1, 0, 1,
            1, -1, 0, 1,
            0, 1, 0, 1
        ]));

     //    this.program = new ShaderProgram(gl, 
    	// fs.readFileSync("rtr-homework0-desc.vert"),
    	// fs.readFileSync("rtr-homework0-desc.frag"));
        this.program = new ShaderProgram(gl,
            "attribute vec4 position; void main(){ gl_Position = position; }",
            "void main() { gl_FragColor = vec4(0.4, 0.3, 0.2, 1.0); }");
    }

    display(t: number): void {
        if (!this.gl || !this.canvasElement_) return;
        let gl = this.gl;
        gl.clearColor(0.2, 0.15 * Math.sin(t) + 0.15, 0.4, 1.0);
        gl.clear(this.gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvasElement_.width, this.canvasElement_.height);
        if (this.vbo && this.program) {
            this.program.Use();
            this.vbo.Render(this.program.GetVertexPosition("position"));
        }
        gl.useProgram(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}