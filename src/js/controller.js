const outerRadius = 200;
const innerRadius = 75;

export default class Controller {

	constructor() {
		this.animAmt = 0;
		this.period = 3;
	}

	/**
	 * Simulate time passing.
	 *
	 * @param {number} dt Time since the last frame, in seconds 
	 */
	update(dt) {
		this.animAmt += dt / this.period;
		this.animAmt %= 1;
	}

	/**
	 * Render the current state of the controller.
	 *
	 * @param {!CanvasRenderingContext2D} context
	 */
	render(context) {
		context.beginPath();

		context.strokeStyle = 'white';

		context.beginPath();
		context.arc(0, 0, outerRadius, 0, 2 * Math.PI);
		context.stroke();

		context.beginPath();
		context.arc(0, 0, innerRadius, 0, 2 * Math.PI);
		context.stroke();
	}

}


function dotProduct(v1, v2) {
	return {
		x: v1.x + v2.x,
		y: v1.y + v2.y,
	};
}

function addVecs(v1, v2) {
	return {
		x: v1.x + v2.x,
		y: v1.y + v2.y,
	}
}

function subVecs(v1, v2) {
	return {
		x: v1.x - v2.x,
		y: v1.y - v2.y,
	}
}