import * as THREE from "three"
import WindowContext from "./js/WindowContext"
import SceneBouncingBubbles from "./js/scenarios/BouncingBubbles/SceneBouncingBubbles"
import { askMotionAccess } from "./js/utils/device/DeviceAccess"
import SceneScenario3D from "./js/scenarios/Scenario3D/SceneScenario3D"
import { randomRange } from "./js/utils/MathUtils"


// https://workshop-web-creadev.vercel.app/


/** device access */
const btn = document.getElementById("btn-access")
btn.addEventListener("click", askMotionAccess, false)

const btnReload = document.getElementById("btn-reload")
btnReload.addEventListener("click", () => { location.reload() })

/** scenarios */
const scene1 = new SceneBouncingBubbles(10)
const scene2 = new SceneScenario3D("canvas-scene-3d")
const scene3 = new SceneBouncingBubbles(10, "canvas-scene-2")

const windowContext = new WindowContext()
console.log(windowContext.scenes)
const time = windowContext.time

/* 
three js le Y est inversé
le 0;0 est au centre de la scène

dépot github
lien prod
texte si besoin pr expliquer les problèmes ou autres
on peut décorer mieux les canvas notamment le three js si on veut
à rendre dans 2 semaines cf le mail 
*/

const update = () => {
    // check des bulles dans les différents scénarios
    const outFromScene1Top = scene1.bubbles.filter(b => {return b.y < 0})
    const outFromScene1Bottom = scene1.bubbles.filter(b => {return b.y > scene1.height})
    const outFromScene2Bottom = scene2.bubbles.filter(b => {return b.position.y < -scene2.height / 2})
    const outFromScene3Top = scene3.bubbles.filter(b => {return b.y < 0})
    const outFromScene3Bottom = scene3.bubbles.filter(b => {return b.y > scene3.height})

    // mise à jour des scénarios
    outFromScene1Top.forEach(b => {
        // remove from scene 1 => update scene1.bubbles
        scene1.bubbles = scene1.bubbles.filter(i => !outFromScene1Top.includes(i))
        //  add to scene2 / scene3 => sceneX.addBubble(b.x, b.y) b.vx (speed random au constructeur)
        scene3.addBubble(b.x, b.y, b.vx, b.vy)
    })

    outFromScene1Bottom.forEach(b => {
        scene1.bubbles = scene1.bubbles.filter(i => !outFromScene1Bottom.includes(i))

        scene2.addBubble(b.x, b.y)
    })

    outFromScene2Bottom.forEach(b => {
        // fonction delete qlq part ?
        scene2.removeBubble(b)

        scene3.addBubble(b.position.x + scene3.width / 2, 1, randomRange(0, 100), randomRange(0, 100))
    })
    
    outFromScene3Top.forEach(b => {
        scene3.bubbles = scene3.bubbles.filter(i => !outFromScene3Top.includes(i))

        scene2.addBubble(b.x, b.y)
    })

    outFromScene3Bottom.forEach(b => {
        // remove from scene 1 => update scene1.bubbles
        scene3.bubbles = scene3.bubbles.filter(i => !outFromScene3Bottom.includes(i))
        //  add to scene2 / scene3 => sceneX.addBubble(b.x, b.y) b.vx (speed random au constructeur)
        scene1.addBubble(b.x, b.y, b.vx, b.vy)
    })
}

time.on('update', update)
