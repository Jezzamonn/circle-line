import Controller from './controller.js';
import Canvas from 'canvas';
import fs from 'fs';
import singleLineLog from 'single-line-log';
import format from 'string-format';
import { join } from 'path';
import mkdirp from 'mkdirp';
import commandLineArgs from 'command-line-args'

function renderFrame(context, controller, width, height) {
    context.resetTransform();
    context.globalAlpha = 1;
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // Set origin to middle.
    context.translate(width / 2, height / 2);

    // min = show all (with borders), max = fit window (no boarders, but part will be cut off)
    const minDimension = Math.min(width, height);
    context.scale(minDimension / 500, minDimension / 500);
    
    controller.render(context);
}

function averageImageDatas(imageDatas, outImageData) {
    for (let i = 0; i < outImageData.data.length; i ++) {
        let sum = imageDatas.map(imageData => imageData.data[i]).reduce((a, b) => a + b, 0);
        outImageData.data[i] = sum / imageDatas.length;
    }
    return outImageData;
}

/**
 * Outputs a bunch of frames as pngs to a directory.
 */
function generateFrames(controller, options, outDirectory) {
    const {width, height, fps, numSubFrames, length, startTime} = options;
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    controller.update(startTime);
    
    const dt = (1 / fps);
    const subFrameTime = dt / numSubFrames;

    mkdirp(outDirectory);
    
    let frameNumber = 0;
    for (let time = 0; time < length; time += dt) {
        const subframes = [];
        for (let i = 0; i < numSubFrames; i ++) {
            renderFrame(context, controller, width, height);
            subframes.push(context.getImageData(0, 0, width, height));
    
            controller.update(subFrameTime);
        }
    
        const averagedFrame = averageImageDatas(subframes, context.createImageData(width, height));
        context.putImageData(averagedFrame, 0, 0);

        const paddedFrame = frameNumber.toString().padStart(4, '0');
        const fileName = `frame${paddedFrame}.png`;
        const filePath = join(outDirectory, fileName);

        fs.writeFileSync(filePath, canvas.toBuffer());
    
        const doneAmt = time / length;
        singleLineLog.stdout(format(
            "Generating frames: {}",
            doneAmt.toLocaleString('en', {style: 'percent'})
        ));

        frameNumber ++;
    }
    
    singleLineLog.stdout("Generating Done!\n")
}

function generateSingleFrame(controller, options, outFileName) {
    const {width, height, startTime} = options;
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    controller.update(startTime);

    renderFrame(context, controller, width, height);
    fs.writeFileSync(outFileName, canvas.toBuffer());
}

function main() {
    const commandLineOptions = [
        { name: 'width', type: parseInt },
        { name: 'height', type: parseInt },
        { name: 'out', type: String },
        { name: 'start', type: parseFloat, defaultValue: 0 },
        { name: 'single_frame', type: Boolean, defaultValue: false },
    ]
    const args = commandLineArgs(commandLineOptions);
    if (!args['width'] || !args['height']) {
        throw new Error('width and height must be valid integers');
    }
    if (!args['out']) {
        throw new Error('pls specify an output directory (--out)');
    }

    const controller = new Controller();
    const options = {
        width: args['width'],
        height: args['height'],
        fps: 30,
        numSubFrames: 4,
        length: controller.period,
        startTime: args['start'],
    }

    if (args['single_frame']) {
        generateSingleFrame(controller, options, args['out']);
        return;
    }

    generateFrames(controller, options, args['out']);
}

main();