export class V3d {
    constructor(x, y, z) {
        this.x = parseFloat(x) * 1;
        this.y = parseFloat(y) * 1;
        this.z = parseFloat(z) * 1;
    }

    subtract(v) {
        return new V3d(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new V3d(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        this.x /= length;
        this.y /= length;
        this.z /= length;
        return this;
    }
}

export class V2d {
    constructor(x, y) {
        this.x = parseFloat(x) * 1;
        this.y = parseFloat(y) * 1;
    }
}

export class Cubo {
    constructor(centro, lado, color) {
        var anchura = lado / 2;
        this.color = color;
        this.zsort = 0;
        this.x = centro.x;
        this.y = centro.y;
        this.z = centro.z;
        this.vertices = [
            new V3d(centro.x - anchura, centro.y - anchura, centro.z + anchura),
            new V3d(centro.x - anchura, centro.y - anchura, centro.z - anchura),
            new V3d(centro.x + anchura, centro.y - anchura, centro.z - anchura),
            new V3d(centro.x + anchura, centro.y - anchura, centro.z + anchura),
            new V3d(centro.x + anchura, centro.y + anchura, centro.z + anchura),
            new V3d(centro.x + anchura, centro.y + anchura, centro.z - anchura),
            new V3d(centro.x - anchura, centro.y + anchura, centro.z - anchura),
            new V3d(centro.x - anchura, centro.y + anchura, centro.z + anchura)
        ];
        this.caras = [
            [this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]],
            [this.vertices[4], this.vertices[5], this.vertices[6], this.vertices[7]],
            [this.vertices[3], this.vertices[2], this.vertices[5], this.vertices[4]],
            [this.vertices[7], this.vertices[6], this.vertices[1], this.vertices[0]],
            [this.vertices[7], this.vertices[0], this.vertices[3], this.vertices[4]],
            [this.vertices[1], this.vertices[6], this.vertices[5], this.vertices[2]]
        ];
    }
}

export class Sphere {
    constructor(cx, cy, cz, radius, usegments, vsegments, color) {
        this.color = color;
        this.zsort = 0;
        this.vertices = [];
        this.caras = [];

        for (let i = 0; i <= usegments; i++) {
            let theta = (i * Math.PI) / usegments;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            for (let j = 0; j <= vsegments; j++) {
                let phi = (j * 2 * Math.PI) / vsegments;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);

                let x = cx + radius * cosPhi * sinTheta;
                let y = cy + radius * cosTheta;
                let z = cz + radius * sinPhi * sinTheta;

                this.vertices.push(new V3d(x, y, z));
            }
        }

        for (let i = 0; i < usegments; i++) {
            for (let j = 0; j < vsegments; j++) {
                let first = (i * (vsegments + 1)) + j;
                let second = first + vsegments + 1;
                this.caras.push([
                    this.vertices[first],
                    this.vertices[second],
                    this.vertices[second + 1],
                    this.vertices[first + 1]
                ]);
            }
        }
    }
}

export class Icosphere {
    constructor(cx, cy, cz, radius, subdivisions, color) {
        this.color = color;
        this.zsort = 0;
        this.vertices = [];
        this.caras = [];

        const t = (1 + Math.sqrt(5)) / 2;
        this.vertices.push(
            new V3d(-1, t, 0), new V3d(1, t, 0), new V3d(-1, -t, 0), new V3d(1, -t, 0),
            new V3d(0, -1, t), new V3d(0, 1, t), new V3d(0, -1, -t), new V3d(0, 1, -t),
            new V3d(t, 0, -1), new V3d(t, 0, 1), new V3d(-t, 0, -1), new V3d(-t, 0, 1)
        );

        const faces = [
            [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
            [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
            [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
            [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
        ];

        for (const face of faces) {
            this.caras.push([this.vertices[face[0]], this.vertices[face[1]], this.vertices[face[2]]]);
        }

        this.vertices.forEach(v => {
            const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
            v.x /= len; v.y /= len; v.z /= len;
        });

        for (let i = 0; i < subdivisions; i++) {
            const newFaces = [];
            const midPointCache = {};

            const getMidPoint = (v1, v2) => {
                const key = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;
                if (midPointCache[key]) return midPointCache[key];

                const mid = new V3d(
                    (this.vertices[v1].x + this.vertices[v2].x) / 2,
                    (this.vertices[v1].y + this.vertices[v2].y) / 2,
                    (this.vertices[v1].z + this.vertices[v2].z) / 2
                );

                const len = Math.sqrt(mid.x * mid.x + mid.y * mid.y + mid.z * mid.z);
                mid.x /= len; mid.y /= len; mid.z /= len;

                const index = this.vertices.length;
                this.vertices.push(mid);
                midPointCache[key] = index;

                return index;
            };

            for (const face of this.caras) {
                const a = this.vertices.indexOf(face[0]);
                const b = this.vertices.indexOf(face[1]);
                const c = this.vertices.indexOf(face[2]);

                const ab = getMidPoint(a, b);
                const bc = getMidPoint(b, c);
                const ca = getMidPoint(c, a);

                newFaces.push([this.vertices[a], this.vertices[ab], this.vertices[ca]]);
                newFaces.push([this.vertices[b], this.vertices[bc], this.vertices[ab]]);
                newFaces.push([this.vertices[c], this.vertices[ca], this.vertices[bc]]);
                newFaces.push([this.vertices[ab], this.vertices[bc], this.vertices[ca]]);
            }

            this.caras = newFaces;
        }

        this.vertices.forEach(v => {
            v.x = cx + v.x * radius;
            v.y = cy + v.y * radius;
            v.z = cz + v.z * radius;
        });
    }
}

export class Torus {
    constructor(cx, cy, cz, radius1, radius2, segmentsU, segmentsV, color) {
        this.color = color;
        this.zsort = 0;
        this.vertices = [];
        this.caras = [];

        for (let i = 0; i <= segmentsU; i++) {
            let theta = (i * 2 * Math.PI) / segmentsU;
            let cosTheta = Math.cos(theta);
            let sinTheta = Math.sin(theta);

            for (let j = 0; j <= segmentsV; j++) {
                let phi = (j * 2 * Math.PI) / segmentsV;
                let cosPhi = Math.cos(phi);
                let sinPhi = Math.sin(phi);

                let x = cx + (radius1 + radius2 * cosTheta) * cosPhi;
                let y = cy + radius2 * sinTheta;
                let z = cz + (radius1 + radius2 * cosTheta) * sinPhi;

                this.vertices.push(new V3d(x, y, z));
            }
        }

        for (let i = 0; i < segmentsU; i++) {
            for (let j = 0; j < segmentsV; j++) {
                let first = (i * (segmentsV + 1)) + j;
                let second = first + segmentsV + 1;
                this.caras.push([
                    this.vertices[first],
                    this.vertices[second],
                    this.vertices[second + 1],
                    this.vertices[first + 1]
                ]);
            }
        }
    }
}

export class Plane {
    constructor(cx, cy, cz, width, height, color) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        this.color = color;
        this.zsort = 0;
        this.vertices = [
            new V3d(cx - halfWidth, cy - halfHeight, cz),
            new V3d(cx + halfWidth, cy - halfHeight, cz),
            new V3d(cx + halfWidth, cy + halfHeight, cz),
            new V3d(cx - halfWidth, cy + halfHeight, cz)
        ];
        this.caras = [
            [this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3]]
        ];
    }
}
