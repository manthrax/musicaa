var vis3 = function() {
    var ctx = {};
    ctx.start = function() {
        var renderer = new THREE.WebGLRenderer();
        var canv = renderer.domElement;
        document.body.appendChild(canv);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        var scene = ctx.scene = new THREE.Scene();
        var camera = ctx.camera = new THREE.PerspectiveCamera(35,// Field of view
        canv.width / canv.height,// Aspect ratio
        0.1,// Near plane
        10000 // Far plane
        );
        camera.position.set(-15, 10, 10);
        camera.lookAt(scene.position);
        var geometry = ctx.geometry = new THREE.BoxGeometry(1,1,1);
        //        var geometry = ctx.geometry = new THREE.CylinderGeometry( 0.5, 0.5, 1,32 );
        var material = ctx.material = new THREE.MeshLambertMaterial({
            color: 0x404040
        });
        //0xFF0000
        var mesh = new THREE.Mesh(geometry,material);
        mesh.scale.multiplyScalar(18);
        mesh.scale.y = 0.1;
        mesh.position.y = -0.5;
        mesh.receiveShadow = true;
        scene.add(mesh);
        var light = new THREE.PointLight(0xFFFFFF);
        light.castShadow = true;
        light.position.set(0, 10, 0);
        light.shadow.bias = 0.0001;
        var SHADOW_MAP_WIDTH = 2048;
        var SHADOW_MAP_HEIGHT = 2048;
        light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
        light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
        scene.add(light);
        function render() {
            ctx.time = performance.now();
            requestAnimationFrame(render);
            renderer.setSize(document.body.clientWidth, document.body.clientHeight);
            ctx.camera.aspect = document.body.clientWidth / document.body.clientHeight;
            ctx.camera.updateProjectionMatrix();
            var camSpin = ctx.time * 0.0001;
            camera.position.set(Math.sin(camSpin) * 25, 10, Math.cos(camSpin) * 10);
            camera.lookAt(scene.position);
            TWEEN.update();
            renderer.setClearColor(0x404040, 1);
            renderer.render(scene, camera);
        }
        render();
    }
    var noteObjs = {}
    ctx.event = function(evt) {
        if (evt.cmd != 'noteOn')
            return;
        var k = evt.channel + '' + evt.note;
        var m = noteObjs[k];
        if (!m) {
            var mat = ctx.material.clone();
            mat.color = new THREE.Color(Math.random(),Math.random(),Math.random());
            var m = noteObjs[k] = new THREE.Mesh(ctx.geometry,mat);
            var theta = evt.note * Math.PI * 0.1;
            //0.35;
            var rad = ((evt.channel * 4) + 2) + (theta * 0.2);
            m.position.set(Math.sin(theta) * rad, 0, Math.cos(theta) * rad);
            m.rotation.y = theta;
            m.castShadow = true;
            m.receiveShadow = true;
            ctx.scene.add(m);
        }
        
        m.tweens = m.tweens ? m.tweens : [];
        if (m.tweens.length > 0) {
            for (var i = 0; i < m.tweens.length; i++) {
                m.tweens[i].stop();
            }
            m.tweens.length = 0;
        }
        // m.position.y+=0.2;
        var easeInFn = TWEEN.Easing.Quintic.Out;
        var easeOutFn = TWEEN.Easing.Quintic.Out;
        var edur = 250;

        function entween(m,elem,val,dur,endval,enddur){
            var ptweenUp = new TWEEN.Tween(elem).to(val,dur).easing(easeInFn);
            var ptweenDown = new TWEEN.Tween(elem).to(endval,enddur).easing(easeOutFn);
            ptweenUp.chain(ptweenDown).start();
            m.tweens.push(ptweenUp);
            m.tweens.push(ptweenDown);
        }
        
        entween(m,m.position,{y:1},edur,{y:0},edur);
        var col = m.material.color;
        entween(m,m.material.emissive,{
            r: col.r + 0.25,
            g: col.g + 0.25,
            b: col.b + 0.25
        },edur,{
            r: 0,
            g: 0,
            b: 0
        },edur*4);
/*

        var ptweenUp = new TWEEN.Tween(m.position).to({
            y: 1
        }, edur).easing(easeInFn);
        var ptweenDown = new TWEEN.Tween(m.position).to({
            y: 0
        }, edur).easing(easeOutFn);
        ptweenUp.chain(ptweenDown).start();
        var col = m.material.color;
        var ctweenUp = new TWEEN.Tween(m.material.emissive).to({
            r: col.r + 0.5,
            g: col.g + 0.5,
            b: col.b + 0.5
        }, edur).easing(easeInFn);
        var ctweenDown = new TWEEN.Tween(m.material.emissive).to({
            r: 0,
            g: 0,
            b: 0
        }, edur * 4).easing(easeOutFn);
        ctweenUp.chain(ctweenDown).start();
        m.tweens.push(ptweenUp, ptweenDown, ctweenUp, ctweenDown)*/
    }
    return ctx;
}();
