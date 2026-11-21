export function createMap(scene, THREE) {
    const mapObjects = [];
    const floorSize = 350;
    
    const texWall = createTexture(THREE, 'whiteWall');
    const texFloor = createTexture(THREE, 'stoneFloor');
    const texCrate = createTexture(THREE, 'crate');
    const texWood = createTexture(THREE, 'wood');
    texFloor.repeat.set(60, 60);

    const matWall = new THREE.MeshLambertMaterial({ map: texWall });
    const matFloor = new THREE.MeshLambertMaterial({ map: texFloor });
    const matCrate = new THREE.MeshLambertMaterial({ map: texCrate });
    const matWood = new THREE.MeshLambertMaterial({ map: texWood });
    const matRock = new THREE.MeshLambertMaterial({ color: 0x666666 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), matFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    function addBlock(x, y, z, w, h, d, mat, isCylinder = false) {
        const geo = isCylinder ? new THREE.CylinderGeometry(w/2, w/2, h, 16) : new THREE.BoxGeometry(w, h, d);
        const block = new THREE.Mesh(geo, mat);
        block.position.set(x, y, z);
        block.castShadow = true;
        block.receiveShadow = true;
        scene.add(block);
        mapObjects.push({ x, z, w, d });
        return block;
    }

    const border = floorSize / 2;
    addBlock(0, 20, border, floorSize, 40, 20, matRock);
    addBlock(0, 20, -border, floorSize, 40, 20, matRock);
    addBlock(border, 20, 0, 20, 40, floorSize, matRock);
    addBlock(-border, 20, 0, 20, 40, floorSize, matRock);

    function createComplexHouse(cx, cz, width, depth, height) {
        const houseFloor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, depth), matWood);
        houseFloor.position.set(cx, 0.25, cz);
        houseFloor.receiveShadow = true;
        scene.add(houseFloor);
        addBlock(cx, height/2, cz - depth/2, width, height, 2, matWall);
        addBlock(cx - width/2, height/2, cz, 2, height, depth, matWall);
        addBlock(cx + width/2, height/2, cz, 2, height, depth, matWall);
        addBlock(cx - width/4, height/2, cz + depth/2, width/2 - 2, height, 2, matWall);
        addBlock(cx + width/4, height/2, cz + depth/2, width/2 - 2, height, 2, matWall);
        addBlock(cx, height - 3, cz + depth/2, 4, height - 6, 2, matWall);
        addBlock(cx, height + 0.5, cz, width + 2, 1, depth + 2, matWall);
        addBlock(cx - width/4, 2, cz - depth/4, 4, 4, 4, matCrate);
        addBlock(cx + width/4, 2, cz + depth/4, 3, 4, 3, matCrate);
    }

    addBlock(0, 5, 0, 35, 10, 35, matWall);
    addBlock(0, 15, 0, 20, 10, 20, matWall);
    createComplexHouse(90, -90, 40, 30, 16);
    createComplexHouse(-90, 90, 40, 30, 14);
    createComplexHouse(130, 130, 30, 30, 14);
    createComplexHouse(-130, -130, 30, 30, 14);
    createComplexHouse(-50, -90, 25, 25, 12);
    createComplexHouse(50, -90, 25, 25, 12);
    createComplexHouse(0, -110, 30, 20, 14);
    createComplexHouse(-50, 90, 25, 25, 12);
    createComplexHouse(50, 90, 25, 25, 12);
    createComplexHouse(0, 110, 30, 20, 14);
    createComplexHouse(-90, 0, 25, 30, 12);
    createComplexHouse(90, 0, 25, 30, 12);

    for(let i=0; i<15; i++) {
        const x = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        if(Math.abs(x) > 40 || Math.abs(z) > 40) addBlock(x, 2, z, 4, 4, 4, matCrate);
    }

    return { mapObjects, floorSize };
}

function createTexture(THREE, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (type === 'whiteWall') {
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(0,0,128,128);
        for(let i=0; i<300; i++) {
            ctx.fillStyle = Math.random() > 0.8 ? '#e0e0d8' : '#ffffff';
            ctx.fillRect(Math.random()*128, Math.random()*128, 3, 3);
        }
    } else if (type === 'stoneFloor') {
        ctx.fillStyle = '#d4c9b8';
        ctx.fillRect(0,0,128,128);
        ctx.fillStyle = '#b8a88c';
        for(let i=0; i<128; i+=32) {
            ctx.fillRect(0, i, 128, 3);
            for(let j=0; j<128; j+=32) {
                ctx.fillRect(j + (i%64===0?16:0), i, 3, 32);
            }
        }
    } else if (type === 'crate') {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(0,0,128,128);
        ctx.strokeStyle = '#5c3a21';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, 120, 120);
        ctx.beginPath();
        ctx.moveTo(4, 4);
        ctx.lineTo(124, 124);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(124, 4);
        ctx.lineTo(4, 124);
        ctx.stroke();
    } else if (type === 'wood') {
        ctx.fillStyle = '#6b4c30';
        ctx.fillRect(0,0,128,128);
        ctx.fillStyle = '#4a3320';
        for(let i=0; i<128; i+=16) {
            ctx.fillRect(0, i, 128, 2);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}