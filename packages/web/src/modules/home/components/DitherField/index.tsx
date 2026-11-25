import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/modules/home/hooks/use-reduced-motion';
import { DITHER_FRAGMENT, DITHER_VERTEX } from '@/modules/home/utils/dither-shader';

/* CSS pixels per dither cell. The canvas renders one pixel per cell and is scaled up unsmoothed. */
const CELL = 2;
const FRAME_MS = 1000 / 30;
const TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

const compile = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if(shader === null) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
};

const link = (gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertex = compile(gl, gl.VERTEX_SHADER, DITHER_VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, DITHER_FRAGMENT);
    const program = gl.createProgram();
    if(vertex === null || fragment === null || program === null) return null;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
};

/*
 * The blue dithered field behind the hero and the self-host band. Without WebGL the canvas stays
 * transparent and the gradient on the parent shows instead; with reduced motion it draws one frame.
 */
const DitherField = () => {
    const ref = useRef<HTMLCanvasElement>(null);
    const isStill = useReducedMotion();

    useEffect(() => {
        const canvas = ref.current;
        const gl = canvas?.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
        if(!canvas || !gl) return;

        const program = link(gl);
        if(program === null) return;
        gl.useProgram(program);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, TRIANGLE, gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        const resolution = gl.getUniformLocation(program, 'u_resolution');
        const time = gl.getUniformLocation(program, 'u_time');
        let isVisible = true;
        let frame = 0;
        let last = 0;

        const draw = (now: number) => {
            gl.uniform2f(resolution, canvas.width, canvas.height);
            gl.uniform1f(time, now / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        const resize = () => {
            canvas.width = Math.max(1, Math.ceil(canvas.clientWidth / CELL));
            canvas.height = Math.max(1, Math.ceil(canvas.clientHeight / CELL));
            gl.viewport(0, 0, canvas.width, canvas.height);
            draw(last);
        };

        const tick = (now: number) => {
            frame = requestAnimationFrame(tick);
            if(!isVisible || now - last < FRAME_MS) return;
            last = now;
            draw(now);
        };

        const sizes = new ResizeObserver(resize);
        const sight = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; });
        sizes.observe(canvas);
        sight.observe(canvas);
        resize();
        if(!isStill) frame = requestAnimationFrame(tick);

        /* The context stays alive: a remount of the same canvas gets it back and builds on it again. */
        return () => {
            cancelAnimationFrame(frame);
            sizes.disconnect();
            sight.disconnect();
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, [isStill]);

    return <canvas ref={ref} aria-hidden='true' className='pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]' />;
};

export default DitherField;
