const outerRadius = 200;
const innerRadius = 75;

const lineHalfLength = Math.sqrt(outerRadius * outerRadius - innerRadius * innerRadius);

export default class Controller {

	constructor() {
		this.animAmt = 0;
		this.period = 10;
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

		// Two circles for reference

		context.beginPath();
		context.arc(0, 0, outerRadius, 0, 2 * Math.PI);
		context.stroke();

		context.beginPath();
		context.arc(0, 0, innerRadius, 0, 2 * Math.PI);
		context.stroke();

		// The line that moves around
		const angle = 2 * Math.PI * this.animAmt;

		this.renderLine(context, angle);
	}

	/**
	 * @param {!CanvasRenderingContext2D} context
	 */
	renderLine(context, angle) {
		const innerVec = {
			x: innerRadius * Math.cos(angle),
			y: innerRadius * Math.sin(angle),
		}
		const chordVec = {
			x: lineHalfLength * Math.sin(angle),
			y: -lineHalfLength * Math.cos(angle),
		}
		const start = addVecs(innerVec, chordVec);
		const end = subVecs(innerVec, chordVec);
		
		context.beginPath();
		context.moveTo(start.x, start.y);
		context.lineTo(end.x, end.y);
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

function magnitude(v) {
	return Math.sqrt(v.x * v.x + v.y * v.y);
}