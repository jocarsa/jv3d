import { V3d, V2d, Cubo, Sphere, Icosphere, Torus, Plane } from './primitives.js';

class jv3d {
    static canvas = document.getElementById("lienzo");
    static context = jv3d.canvas.getContext("2d");
    static width = window.innerWidth;
    static height = window.innerHeight;
    static centerX = jv3d.width / 2;
    static centerY = jv3d.height / 2;

    static initCanvas() {
        jv3d.canvas.width = jv3d.width;
        jv3d.canvas.height = jv3d.height;
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomColor() {
        const r = jv3d.getRandomInt(200, 255);
        const g = jv3d.getRandomInt(200, 255);
        const b = jv3d.getRandomInt(200, 255);
        return [r / 255, g / 255, b / 255];
    }

    static addRandomObjects(scene) {
		let numero = 5
        // Create 3 random cubes
		
        for (let i = 0; i < numero; i++) {
            const x = jv3d.getRandomInt(-400, 400);
            const y = jv3d.getRandomInt(-400, 400);
            const z = jv3d.getRandomInt(-400, 400);
            const size = jv3d.getRandomInt(50, 150);
            const color = jv3d.getRandomColor();
            const cube = new Cubo(new V3d(x, y, z), size, color);
            scene.addObject(cube);
        }
		
		
        // Create 2 random spheres
        for (let i = 0; i < numero; i++) {
            const x = jv3d.getRandomInt(-400, 400);
            const y = jv3d.getRandomInt(-400, 400);
            const z = jv3d.getRandomInt(-400, 400);
            const radius = jv3d.getRandomInt(50, 150);
            const color = jv3d.getRandomColor();
            const sphere = new Sphere(x, y, z, radius, 10, 10, color);
            scene.addObject(sphere);
        }

        // Create 2 random icospheres
        for (let i = 0; i < numero; i++) {
            const x = jv3d.getRandomInt(-400, 400);
            const y = jv3d.getRandomInt(-400, 400);
            const z = jv3d.getRandomInt(-400, 400);
            const radius = jv3d.getRandomInt(50, 150);
            const subdivisions = jv3d.getRandomInt(1, 3);
            const color = jv3d.getRandomColor();
            const icosphere = new Icosphere(x, y, z, radius, subdivisions, color);
            scene.addObject(icosphere);
        }

        // Create 3 random tori
        for (let i = 0; i < numero; i++) {
            const x = jv3d.getRandomInt(-400, 400);
            const y = jv3d.getRandomInt(-400, 400);
            const z = jv3d.getRandomInt(-400, 400);
            const radius1 = jv3d.getRandomInt(50, 150);
            const radius2 = jv3d.getRandomInt(20, 50);
            const segmentsU = jv3d.getRandomInt(8, 20);
            const segmentsV = jv3d.getRandomInt(8, 20);
            const color = jv3d.getRandomColor();
            const torus = new Torus(x, y, z, radius1, radius2, segmentsU, segmentsV, color);
            scene.addObject(torus);
        }
		/*
        // Create 2 random planes
        for (let i = 0; i < numero; i++) {
            const x = jv3d.getRandomInt(-400, 400);
            const y = jv3d.getRandomInt(-400, 400);
            const z = jv3d.getRandomInt(-400, 400);
            const width = jv3d.getRandomInt(200, 400);
            const height = jv3d.getRandomInt(200, 400);
            const color = jv3d.getRandomColor();
            const plane = new Plane(x, y, z, width, height, color);
            scene.addObject(plane);
        }
		*/
    }

    static renderScene(scene) {
        jv3d.scene = scene;
        jv3d.representacion(scene, jv3d.context, jv3d.centerX, jv3d.centerY, jv3d.width, jv3d.height);
    }

      static empiezaMovimiento(event, state) {
        state.ratonPulsado = true;
        state.mx = event.clientX;
        state.my = event.clientY;
        event.preventDefault();
    }

    static mover(event, state) {
        if (state.ratonPulsado) {
            const deltaX = event.clientX - state.mx;
            const deltaY = event.clientY - state.my;

            state.scene.camera.rotateLookAt(deltaX, deltaY);

            state.mx = event.clientX;
            state.my = event.clientY;
            jv3d.representacion(state.scene, state.contexto, state.centrox, state.centroy, state.anchura, state.altura);
        }
    }

    static paraMovimiento(state) {
        state.ratonPulsado = false;
    }

    static handleKeyDown(event, state) {
        console.log(`Key pressed: ${event.key}`);
        const keyMap = {
            'w': { x: 0, y: 0, z: 10 },
            's': { x: 0, y: 0, z: -10 },
            'a': 'yawLeft',
            'd': 'yawRight'
        };

        const action = keyMap[event.key.toLowerCase()];
        if (action) {
            if (action === 'yawLeft') {
                console.log('Rotating yaw left');
                state.scene.camera.rotateYaw(-Math.PI / 180);
            } else if (action === 'yawRight') {
                console.log('Rotating yaw right');
                state.scene.camera.rotateYaw(Math.PI / 180);
            } else {
                console.log('Translating camera');
                state.scene.camera.move(action.x, action.y, action.z);
            }
            jv3d.representacion(state.scene, state.contexto, state.centrox, state.centroy, state.anchura, state.altura);
        }
    }

    static ObjLoader = class ObjLoader {
        constructor() {}

        load(data, color) {
            const vertices = [];
            const faces = [];
            const lines = data.split('\n');

            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('v ')) {
                    const [, x, y, z] = line.split(/\s+/);
                    vertices.push(new V3d(x, y, z));
                } else if (line.startsWith('f ')) {
                    const indices = line.split(/\s+/).slice(1).map(v => parseInt(v.split('/')[0]) - 1);
                    const face = indices.map(index => vertices[index]);
                    faces.push(face);
                }
            }

            return { vertices, faces, color };
        }

        static toObject(vertices, faces, color) {
            const obj = {
                vertices: vertices,
                caras: faces,
                color: color,
                zsort: 0
            };
            return obj;
        }
    };

    static Camera = class Camera {
        constructor(position, lookAt) {
            this.position = position;
            this.lookAt = lookAt;
            this.up = new V3d(0, 1, 0);
        }

        project(O, dx, dy) {
            const persp = 600;
            const dz = O.z - this.position.z;

            if (dz <= 0) {
                return new V2d(-10000, -10000);
            }

            const scale = persp / dz;
            return new V2d(
                dx + scale * (O.x - this.position.x),
                dy - scale * (O.y - this.position.y)
            );
        }

        move(deltaX, deltaY, deltaZ) {
            this.position.x += deltaX;
            this.position.y += deltaY;
            this.position.z += deltaZ;
            this.lookAt.x += deltaX;
            this.lookAt.y += deltaY;
            this.lookAt.z += deltaZ;
        }

        rotate(yaw, pitch) {
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);

            let x = this.lookAt.x - this.position.x;
            let y = this.lookAt.y - this.position.y;
            let z = this.lookAt.z - this.position.z;

            let x1 = cosYaw * x - sinYaw * z;
            let z1 = sinYaw * x + cosYaw * z;

            let y1 = cosPitch * y - sinPitch * z1;
            let z2 = sinPitch * y + cosPitch * z1;

            this.lookAt.x = x1 + this.position.x;
            this.lookAt.y = y1 + this.position.y;
            this.lookAt.z = z2 + this.position.z;
        }

        rotateYaw(yaw) {
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);

            let x = this.lookAt.x - this.position.x;
            let z = this.lookAt.z - this.position.z;

            let x1 = cosYaw * x - sinYaw * z;
            let z1 = sinYaw * x + cosYaw * z;

            this.lookAt.x = x1 + this.position.x;
            this.lookAt.z = z1 + this.position.z;
        }

        rotateLookAt(deltaX, deltaY) {
            const yaw = deltaX * Math.PI / 360;
            const pitch = deltaY * Math.PI / 360;

            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const cosPitch = Math.cos(pitch);
            const sinPitch = Math.sin(pitch);

            let x = this.lookAt.x - this.position.x;
            let y = this.lookAt.y - this.position.y;
            let z = this.lookAt.z - this.position.z;

            let x1 = cosYaw * x - sinYaw * z;
            let z1 = sinYaw * x + cosYaw * z;

            let y1 = cosPitch * y - sinPitch * z1;
            let z2 = sinPitch * y + cosPitch * z1;

            this.lookAt.x = x1 + this.position.x;
            this.lookAt.y = y1 + this.position.y;
            this.lookAt.z = z2 + this.position.z;
        }
    };

static AmbientLight = class AmbientLight {
        constructor(color) {
            this.color = color;
        }
    };
    static OmniLight = class OmniLight {
        constructor(position, color) {
            this.position = position;
            this.color = color;
        }
    };

    static DirectionalLight = class DirectionalLight {
        constructor(direction, color) {
            this.direction = direction.normalize();
            this.color = color;
        }
    };

  static Scene = class Scene {
    constructor() {
        this.objects = [];
        this.lights = [];
        this.camera = new jv3d.Camera(new V3d(0, -300, 0), new V3d(0, 0, 0));
        this.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.ambientLights = []; // List of ambient lights
    }

    addObject(object) {
        this.objects.push(object);
    }

    addLight(light) {
        this.lights.push(light);
    }

    addAmbientLight(ambientLight) {
        this.ambientLights.push(ambientLight);
    }

    setCamera(camera) {
        this.camera = camera;
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    calculateLighting(normal, position, color) {
        let r = 0, g = 0, b = 0;

        // Add ambient light contribution
        for (let ambientLight of this.ambientLights) {
            r += ambientLight.color[0] * color[0];
            g += ambientLight.color[1] * color[1];
            b += ambientLight.color[2] * color[2];
        }

        // Add other light contributions
        for (let light of this.lights) {
            let lightDir;
            if (light instanceof jv3d.OmniLight) {
                lightDir = light.position.subtract(position).normalize();
            } else if (light instanceof jv3d.DirectionalLight) {
                lightDir = light.direction;
            }

            const dot = normal.dot(lightDir);
            if (dot > 0) {
                r += dot * light.color[0] * color[0];
                g += dot * light.color[1] * color[1];
                b += dot * light.color[2] * color[2];
            }
        }

        r = Math.min(255, r * 255);
        g = Math.min(255, g * 255);
        b = Math.min(255, b * 255);
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    recalculateNormals() {
        for (let obj of this.objects) {
            for (let cara of obj.caras) {
                let normal = cara[1].subtract(cara[0]).cross(cara[2].subtract(cara[0])).normalize();
                cara.normal = normal;  // Save the normal for later use
            }
        }
    }

    render(contexto, dx, dy, anchura, altura) {
        contexto.fillStyle = this.backgroundColor;
        contexto.fillRect(0, 0, anchura, altura);

        // Sort objects by their average z value
        this.objects.forEach(obj => {
            obj.zsort = obj.vertices.reduce((sum, v) => sum + v.z, 0) / obj.vertices.length;
        });
        this.objects.sort((a, b) => b.zsort - a.zsort);

        for (let obj of this.objects) {
            for (let cara of obj.caras) {
                // Ensure normal is recalculated
                if (!cara.normal) {
                    cara.normal = cara[1].subtract(cara[0]).cross(cara[2].subtract(cara[0])).normalize();
                }

                let normal = cara.normal;

                // Calculate vector from camera to face
                let viewVector = this.camera.position.subtract(cara[0]).normalize();

                // If dot product of normal and view vector is positive, the face is visible
                if (normal.dot(viewVector) < 0) {
                    let position = cara[0];
                    let shadedColor = this.calculateLighting(normal, position, obj.color);

                    contexto.fillStyle = shadedColor;

                    let P = this.camera.project(cara[0], dx, dy);
                    contexto.beginPath();
                    contexto.moveTo(P.x, P.y);

                    for (let vertex of cara) {
                        P = this.camera.project(vertex, dx, dy);
                        contexto.lineTo(P.x, P.y);
                    }

                    contexto.closePath();
                    contexto.stroke();
                    contexto.fill();
                }
            }
        }
    }
};



    static representacion(scene, contexto, dx, dy, anchura, altura) {
        scene.render(contexto, dx, dy, anchura, altura);
    };

    static rotar(O, centro, yaw, pitch, roll) {
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);
        const cosRoll = Math.cos(roll);
        const sinRoll = Math.sin(roll);

        let x = O.x - centro.x;
        let y = O.y - centro.y;
        let z = O.z - centro.z;

        let x1 = cosYaw * x - sinYaw * z;
        let z1 = sinYaw * x + cosYaw * z;

        let y1 = cosPitch * y - sinPitch * z1;
        let z2 = sinPitch * y + cosPitch * z1;

        let x2 = cosRoll * x1 - sinRoll * y1;
        let y2 = sinRoll * x1 + cosRoll * y1;

        O.x = x2 + centro.x;
        O.y = y2 + centro.y;
        O.z = z2 + centro.z;
    };
}

export default jv3d;
