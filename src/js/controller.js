const outerRadius = 200;
const innerRadius = 100;

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
		this.renderStrangeShape(context, this.animAmt);
	}

	/**
	 * @param {!CanvasRenderingContext2D} context
	 */
	renderStrangeShape(context, animAmt) {
		context.strokeStyle = 'white';
		context.lineCap = 'round';
		context.lineJoin = 'round';
		// The line that moves around
		const lineAngle = 2 * Math.PI * animAmt;
		const lineDirection = {
			x: Math.cos(lineAngle),
			y: Math.sin(lineAngle),
		}
		const linePoint = {
			x: innerRadius * lineDirection.y,
			y: innerRadius * -lineDirection.x,
		};

		this.renderLine(context, linePoint, lineDirection);

		const numCircles = 8;
		for (let i = 0; i < numCircles; i++) {
			const amt = i / numCircles;
			this.renderCircleThing(context, 2 * Math.PI * amt, linePoint, lineDirection, );
		}
	}

	/**
	 * @param {!CanvasRenderingContext2D} context
	 */
	renderBoundaryCircles(context) {
		context.beginPath();
		context.arc(0, 0, outerRadius, 0, 2 * Math.PI);
		context.stroke();

		context.beginPath();
		context.arc(0, 0, innerRadius, 0, 2 * Math.PI);
		context.stroke();
	}

	/**
	 * @param {!CanvasRenderingContext2D} context
	 */
	renderLine(context, linePoint, lineDirection) {
		const intersections = getCircleLineIntersections(
			{x: 0, y: 0},
			outerRadius,
			linePoint,
			lineDirection);
		// These should always exist
		context.globalAlpha = 0.1;
		context.beginPath();
		context.moveTo(intersections[0].x, intersections[0].y);
		context.lineTo(intersections[1].x, intersections[1].y);
		context.stroke();
		context.globalAlpha = 1;
	}

	/**
	 * @param {!CanvasRenderingContext2D} context
	 */
	renderCircleThing(context, circleAngle, linePoint, lineDirection) {
		const centerRadius = (innerRadius + outerRadius) / 2;
		const center = {
			x: centerRadius * Math.cos(circleAngle),
			y: centerRadius * Math.sin(circleAngle),
		}
		const circleRadius = (outerRadius - innerRadius) / 2;

		context.lineStyle = 'white';
		context.fillStyle = 'white';
		// Also draw the places it crosses over?
		const intersections = getCircleLineIntersections(center, circleRadius, linePoint, lineDirection);
		if (intersections == null) {
			return;
		}

		// 'cause we know line point is in the middle. Otherwise we could tweak line direction but eh
		const cp = crossProduct(center, linePoint);

		const [end, start] = intersections;
		// :( expensive
		const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
		const endAngle = Math.atan2(end.y - center.y, end.x - center.x);

		context.beginPath();
		context.arc(center.x, center.y, circleRadius, startAngle, endAngle);
		context.stroke();

		const point = cp > 0 ? start : end;

		context.beginPath();
		context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
		context.fill();
	}
}

function getCircleLineIntersections(circleCenter, circleRadius, linePoint, lineDirection) {
	// context for debugging
	const linePointToCenter = subVecs(circleCenter, linePoint);
	const linePointToClosestPoint = scalarMultiply(dotProduct(linePointToCenter, lineDirection), lineDirection);
	const closestPoint = addVecs(linePoint, linePointToClosestPoint);
	const centerToClosest = subVecs(closestPoint, circleCenter);
	const closestPointDist = magnitude(centerToClosest);

	if (closestPointDist > circleRadius) {
		// No intersections mate-o!
		return null;
	}
	const distToIntersection = Math.sqrt(circleRadius * circleRadius - closestPointDist * closestPointDist);
	return [
		addVecs(closestPoint, scalarMultiply(distToIntersection, lineDirection)),
		addVecs(closestPoint, scalarMultiply(-distToIntersection, lineDirection)),
	];
}

function scalarMultiply(s, v) {
	return {
		x: s * v.x,
		y: s * v.y,
	}
}

function dotProduct(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
}

function crossProduct(v1, v2) {
	// Just the magnitude / sign as the direction is somewhat meaningless
	return v1.x * v2.y - v1.y * v2.x;
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