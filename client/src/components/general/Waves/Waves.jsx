import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import './Waves.css';

const Plane = () => {
    const $mesh = useRef();
    const { viewport } = useThree();
    
    useFrame(({ clock }) => {
        $mesh.current.material.uniforms.T.value = clock.getElapsedTime();
    });

    const args = useMemo(() => ({
        uniforms: {
            T: { value: 0 },
            R: { value: viewport.height }
        },
        vertexShader:`
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float T;
            uniform float R;
            float S (float t) { return smoothstep(.03/R, .0, t); }
            float L (float i, vec2 u){ 
                return pow(sin(u.x * 3. - sin(i * 6.28) * .6), 20.) * sin(T + i * 3.) * .2 + u.y - i;
            } 
            void main(){
                vec2 u = vUv;
                float c = 0.;
                for(float i = 1.; i > -0.2; i -= .06){
                    c = max(c, S(abs(L(i, u)) - .004/R) - S(L(i - .06, u)) - S(L(i - .12, u)) - S(L(i - .18, u)));
                }
                gl_FragColor = vec4(S(1.-c));
            }
      `,
    }), [viewport]);

    return (
        <mesh ref={$mesh}>
            <planeGeometry args={[viewport.width, viewport.height ]} />
            <shaderMaterial args={[args]} />
        </mesh>
    );
};

const Waves = () => {

    return (
        <Canvas camera={{ position: [0, 0, 1], fov: 110 }} id='Waves-Container'>
            <Plane />
        </Canvas>
    );
};

export default Waves;