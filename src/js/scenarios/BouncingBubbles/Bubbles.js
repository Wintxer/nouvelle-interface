import { circle } from "../../canvas-2d/Shapes2D"
import { randomRange, clamp } from "../../utils/MathUtils"

export default class Bubble {
    constructor(context, x, y, radius) {
        this.context = context
        this.x = x
        this.y = y
        this.radius = radius

        /** animate */
        this.vx = randomRange(-100, 100)
        this.vy = randomRange(-100, 100)

        /** gravity */
        this.gx = 0
        this.gy = 1
    }

    update(width, height, deltaTime = 16, speed = 1) {
        /** update bubble coordinates */
        this.x += (this.vx + this.gx) * speed * deltaTime / 1000
        this.y += (this.vy + this.gy) * speed * deltaTime / 1000

        // /** bounce */
        // if (this.x < this.radius || this.x > width - this.radius) this.vx *= -1 // old
        // if (this.y < this.radius || this.y > height - this.radius) this.vy *= -1 // old
        this.vx = this.x < this.radius ? Math.abs(this.vx) : this.vx
        this.vx = this.x > width - this.radius ? -Math.abs(this.vx) : this.vx
        // this.vy = this.y < this.radius ? Math.abs(this.vy) : this.vy
        // this.vy = this.y > height - this.radius ? -Math.abs(this.vy) : this.vy

        /** constrain bubbles (cf. gravity) */
        this.x = clamp(this.x, this.radius, width - this.radius)
        // this.y = clamp(this.y, this.radius, height - this.radius)
    }

    draw() {
        circle(this.context, this.x, this.y, this.radius, { isFill: true })
    }
}