"""Browser smoke test for the CadTech-style 3D viewport (needs: pip install playwright && playwright install chromium).
Run from atelier_upgrade/:   python3 tests/browser/viewport3d-smoke.py
Serves dist/ itself, loads the default house, adds a hip roof with trusses, and checks camera presets, orbit, zoom, picking,
display styles, layers, plan <-> 3D switching and that nothing throws."""
import subprocess,sys,time,os,socket,json
from playwright.sync_api import sync_playwright
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','dist')
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
srv=subprocess.Popen([sys.executable,'-m','http.server',str(port),'--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
fails=[];ok=lambda c,m:(None if c else fails.append(m))
try:
  with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=b.new_page(viewport={'width':1500,'height':900});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:200]))
    pg.goto(f'http://127.0.0.1:{port}/');pg.wait_for_timeout(1200)
    ok(pg.evaluate("!!globalThis.cadtechViewport"),'viewport booted (WebGL + Three.js)')
    pg.evaluate("""model.elements.push({id:'R-1',type:'roof',story:model.elements[0].story,layer:'Structure',points:[{x:0,y:0},{x:13000,y:0},{x:13000,y:9000},{x:0,y:9000}],pitch:25,height:3000,overhang:450,thickness:200,roofType:'hip',roofFraming:{system:'trusses'}});render();""")
    pg.click('text=3D framing');pg.wait_for_timeout(1800)
    ok(pg.evaluate("document.getElementById('viewport3d').style.display")=='block','canvas visible in 3D framing')
    meshes=pg.evaluate("globalThis.cadtechViewport.root.children.length");ok(meshes>50,f'scene built ({meshes} meshes)')
    ok(pg.evaluate("getComputedStyle(document.body).backgroundColor")!='' ,'page ok')
    # presets land exactly where Atelier says they should
    exp={'top':1.57,'front':0,'right':0,'isometric':.62}
    pg.mouse.move(760,520);pg.mouse.down();pg.mouse.move(900,470,steps=8);pg.mouse.up();pg.wait_for_timeout(500)
    ok(pg.evaluate("sceneCamera.preset")=='custom','dragging switches preset to custom')
    for name in ['top','front','right','isometric','top','isometric']:
        pg.click(f'[data-camera={name}]');pg.wait_for_timeout(700)
        tilt=pg.evaluate("+globalThis.cadtechViewport.direction().z.toFixed(2)");want={'top':1,'front':0,'right':0,'isometric':.58}[name]
        ok(abs(tilt-want)<.03,f'preset {name}: camera elevation {tilt} (want {want})')
    ok(pg.evaluate("globalThis.cadtechViewport.camera.isPerspectiveCamera"),'isometric preset is perspective')
    # zoom: wheel and the +/- buttons
    dist=lambda:pg.evaluate("globalThis.cadtechViewport.camera.position.distanceTo(globalThis.cadtechViewport.controls.target)")
    d0=dist();pg.mouse.move(700,450);pg.mouse.wheel(0,-500);pg.wait_for_timeout(800);d1=dist();pg.click('#zoom-in');pg.wait_for_timeout(400);d2=dist()
    ok(d1<d0*.95 and d2<d1*.95,f'zoom wheel/button move the camera ({d0:.1f} -> {d1:.1f} -> {d2:.1f})')
    # picking selects an element; clicking empty space clears it
    pg.click('[data-camera=isometric]');pg.wait_for_timeout(800);pg.evaluate("select([])");pg.mouse.click(620,560);pg.wait_for_timeout(500)
    ok(len(pg.evaluate("selected"))==1,'click selects the element under the cursor')
    pg.mouse.click(300,700);pg.wait_for_timeout(400);ok(pg.evaluate("selected").__len__()==0,'click on empty space clears the selection')
    # projection + styles + layers
    pg.select_option('#camera-projection','orthographic');pg.wait_for_timeout(500);ok(pg.evaluate("globalThis.cadtechViewport.camera.isOrthographicCamera"),'orthographic toggle')
    pg.select_option('#camera-projection','perspective');pg.wait_for_timeout(300)
    for st in ['hiddenline','xray','materials','shaded']:
        pg.select_option('#camera-shading',st);pg.wait_for_timeout(400)
    vis=lambda:pg.evaluate("globalThis.cadtechViewport.root.children.filter(m=>m.visible).length")
    n0=vis();pg.uncheck('[data-layer3d=walls]');pg.uncheck('[data-layer3d=top]');pg.wait_for_timeout(300);n1=vis()
    ok(n1<n0,f'layer toggles hide meshes ({n0} -> {n1})');pg.check('[data-layer3d=walls]');pg.check('[data-layer3d=top]')
    pg.select_option('[data-color3d]','role');pg.select_option('[data-color3d]','family');pg.check('[data-layer3d=labels]');pg.wait_for_timeout(300)
    ok(pg.evaluate("globalThis.cadtechViewport.labels.children.length")>0,'truss ID labels built')
    # editing the roof rebuilds the scene
    pg.evaluate("model.elements.find(e=>e.type==='roof').pitch=40;render()");pg.wait_for_timeout(800)
    ok(pg.evaluate("Math.max(...globalThis.cadtechViewport.root.children.map(m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox.max.z}))")>6,'pitch edit regenerates 3D geometry')
    # plan <-> 3D
    pg.click('text=Ground floor');pg.wait_for_timeout(500);ok(pg.evaluate("document.getElementById('viewport3d').style.display")=='none','viewport hidden in the plan')
    pg.click('text=3D model');pg.wait_for_timeout(1200);ok(pg.evaluate("document.getElementById('viewport3d').style.display")=='block','viewport back in 3D model')
    ok(not errs,f'no page errors: {errs[:2]}')
    b.close()
finally:srv.terminate()
print('FAIL:\n - '+'\n - '.join(fails) if fails else 'PASS: CadTech-style viewport (presets, orbit, zoom, picking, styles, layers, labels, edit/rebuild, view switching)');sys.exit(1 if fails else 0)
