class homework1 {
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
            0, 1, 0, 1,
            1, 1, 0, 1,
            -1, 1, 0, 1,
            0, -1, 0, 1,
        ]));

        var self = this;
        var loader = new ShaderLoader("rtr-homework1-desc.vert", "rtr-homework1-desc.frag", 
            function(vertShaderSource: string, fragShaderSource: string) {
                self.program = new ShaderProgram(gl, vertShaderSource, fragShaderSource);
        });
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