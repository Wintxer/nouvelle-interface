import * as THREE from "three"
import Scene3D from "../../canvas-3d-threejs/Scene3D"
import { clamp, randomRange } from "../../utils/MathUtils"
import { Bodies, Body, Composite, Engine, Runner } from "matter-js"

class Bubble extends THREE.Mesh {
    constructor(radius, color) {
        super()
        this.geometry = new THREE.BoxGeometry(radius * 2, radius * 2, 2 * radius)
        this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })

        this.body = Bodies.rectangle(0, 0, radius * 2, radius * 2)
    }

    setPosition(x, y) {
        this.position.set(x, y, 0)

        Body.setPosition(this.body, {x: x, y: -y})
    }

    update() {
        this.position.x = this.body.position.x
        this.position.y = -this.body.position.y
        this.rotation.z = -this.body.angle
    }
}

class Wall extends THREE.Mesh {
    constructor(color) {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
        super(geometry, material)

        this.depth = 1

        this.body = Bodies.rectangle(0, 0, 1, 1, { isStatic: true })
    }

    setSize(width, height) {
        const oldScaleX_ = this.scale.x
        const oldScaleY_ = this.scale.y
        Body.scale(this.body, width / oldScaleX_, height / oldScaleY_)
        this.scale.set(width, height, this.depth)
    }

    setPosition(x, y) {
        this.position.set(x, y, 0)

        Body.setPosition(this.body, {x: x, y: -y})
    }
}

export default class SceneScenario3D extends Scene3D {
    constructor(id = "canvas-scene", nBubbles = 10) {
        super(id)

        /** change default camera -> orthographic camera */
        this.camera = new THREE.OrthographicCamera(
            -this.width / 2, this.width / 2,
            this.height / 2, -this.height / 2
        )
        this.camera.position.z = 100

        /** wall */
        this.wallLeft = new Wall('blue')
        // this.wallTop = new Wall('yellow')
        this.wallRight = new Wall('blue')
        // this.wallBottom = new Wall('yellow')
        this.add(this.wallLeft)
        // this.add(this.wallTop)
        this.add(this.wallRight)
        // this.add(this.wallBottom)

        this.floorLeft = new Wall('white')
        this.floorRight = new Wall('white')
        this.add(this.floorLeft)
        this.add(this.floorRight)

        this.wallLeft.depth = 100
        // this.wallTop.depth = 100
        this.wallRight.depth = 100
        // this.wallBottom.depth = 100
        this.floorLeft.depth = 100
        this.floorRight.depth = 100

        /** bubbles */
        this.bubbles = []
        this.radius = 20
        this.colors = ['red', 'blue', 'yellow']
        for (let i = 0; i < nBubbles; i++) {
            const bubble_ = new Bubble(this.radius, this.colors[i % this.colors.length])
            const x_ = randomRange(-this.width / 2, this.width / 2)
            const y_ = randomRange(-this.height / 2, this.height / 2)
            bubble_.setPosition(x_, y_)
            this.add(bubble_)
            this.bubbles.push(bubble_)
        }

        this.bodies = [
            this.wallLeft.body,
            // this.wallTop.body,
            this.wallRight.body,
            // this.wallBottom.body,
            this.floorLeft.body,
            this.floorRight.body
        ]
        this.bubbles.forEach(b => this.bodies.push(b.body))
        this.engine = Engine.create({ render: {visible: false}});
        Composite.add(this.engine.world, this.bodies)
        this.runner = Runner.create()
        Runner.run(this.runner, this.engine)
        this.engine.gravity.scale *= 2

        this.windowContext.useDeviceAcceleration = true
        this.acceleration = this.windowContext.acceleration

        /** init */
        this.resize()
    }

    addBubble(x, y) {
        let maNewBulle_
        const randomColor_ = Math.floor(Math.random() * this.colors.length)

        if (y > 0) {
            maNewBulle_ = new Bubble(this.radius, this.colors[randomColor_])
            maNewBulle_.setPosition(x - this.width / 2, this.height / 2) // 0;0 est au centre donc faut recalculer
        } else {
            maNewBulle_ = new Bubble(this.radius, this.colors[randomColor_])
            maNewBulle_.setPosition(x - this.width / 2, -this.height / 2) // 0;0 est au centre donc faut recalculer
        }
        this.add(maNewBulle_)
        this.bubbles.push(maNewBulle_)
        this.bodies.push(maNewBulle_.body)
        Composite.add(this.engine.world, maNewBulle_.body)
        // this.update()
        // !! update Composite (les bodies de l'engine de la scène)
    }

    removeBubble(bubble) {
        // destroy geometry et material 
        bubble.geometry.dispose()
        bubble.material.dispose()
        bubble.removeFromParent()

        // remove from physics engine = update Composite
        Composite.remove(this.engine.world, bubble.body)

        // remove from this.bubbles
        const bubbleIndex_ = this.bubbles.indexOf(bubble)
        if (bubbleIndex_ !== -1) {
            this.bubbles.splice(bubbleIndex_, 1)
        } 
    }

    update() {
        super.update()
        // mettre à jour animations + simulation physique
        if (!!this.bubbles) {
            this.bubbles.forEach(b => b.update())
        }
    }

    // onDeviceOrientation() {
    //     let gx_ = this.orientation.gamma / 90 // -1 : 1
    //     let gy_ = this.orientation.beta / 90 // -1 : 1
    //     gx_ = clamp(gx_, -1, 1)
    //     gy_ = clamp(gy_, -1, 1)

    //     /** debug gravity orientation */
    //     let coordinates_ = ""
    //     coordinates_ = coordinates_.concat(
    //         gx_.toFixed(2), ", ", // -> autour de Y = gauche / droite
    //         gy_.toFixed(2) // -> autour de X = avant / arrière
    //     )
    //     this.debug.domDebug = coordinates_

    //     this.engine.gravity.x = gx_
    //     this.engine.gravity.y = gy_
    // }

    onDeviceAcceleration() {
        /** debug gravity orientation */
        let coordinates_ = ""
        coordinates_ = coordinates_.concat(
            this.acceleration.x.toFixed(2), ", ", // -> autour de Y = gauche / droite
            this.acceleration.y.toFixed(2), // -> autour de X = avant / arrière
            this.acceleration.z.toFixed(2) // -> autour de X = avant / arrière
        )
        this.debug.domDebug = coordinates_

        this.engine.gravity.x = -this.acceleration.x / 9.81
        this.engine.gravity.y = this.acceleration.y / 9.81
    }

    resize() {
        super.resize()

        this.camera.left = -this.width / 2
        this.camera.right = this.width / 2
        this.camera.top = this.height / 2
        this.camera.bottom = - this.height / 2

        if (!!this.wallLeft) {
            const thickness_ = 10

            /** walls sizes */
            this.wallLeft.setSize(thickness_, this.height)
            // this.wallTop.setSize(this.width - 2 * thickness_, thickness_)
            this.wallRight.setSize(thickness_, this.height)
            // this.wallBottom.setSize(this.width - 2 * thickness_, thickness_)
            this.floorLeft.setSize(this.width / 1.25, thickness_ * 1.5)
            this.floorRight.setSize(this.width / 1.25, thickness_ * 1.5)

            /** walls position */
            this.wallLeft.setPosition(-this.width / 2 + thickness_ / 2, 0)
            // this.wallTop.setPosition(0, this.height / 2 - thickness_ / 2)
            this.wallRight.setPosition(this.width / 2 - thickness_ / 2, 0)
            // this.wallBottom.setPosition(0, -this.height / 2 + thickness_ / 2)
            this.floorLeft.setPosition((-this.width / 4), this.height / 5)
            this.floorRight.setPosition(this.width / 4, - this.height / 5)
        }
    }
}