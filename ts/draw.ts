import { ctx } from "./init";

interface Coordinate {
    x : number, 
    y : number
}

export function drawWithParameters(
    width : number,
    height: number) {
        //Translate absolute measurement values to pixels
        let m = translateToPixels(width, height, 150);
        let pwidth = m.x;
        let pheight = m.y;

        //Draw outline of surface
        ctx.beginPath();
        let coords = findStartingCoordinates(pwidth, pheight);
        ctx.rect(coords.x, coords.y, pwidth, pheight);
        ctx.stroke();

        //Draw measurements of outline
        let altcoords = {x:0, y:0};
        altcoords = Object.assign(altcoords, coords);
        altcoords.y -= 15
        drawStraightMeasurementArrow(altcoords, pwidth, width);
        altcoords = Object.assign(altcoords, coords);
        altcoords.x -= 15
        drawStraightMeasurementArrow(altcoords, pheight, height, true);
}

/**
 * Draw a measurement arrow with label. Location is the upper right hand based.
 * @param location Coord to start drawing the arrow at 
 * @param width Size of arrow
 * @param actualwidth Width to display in label
 * @param vertical Arrow vertical or not
 */
function drawStraightMeasurementArrow(location : Coordinate, width : number, actualwidth: number, vertical = false) {
    //Quick mafs to get good coords
    let fromx : number, tox : number, fromy : number, toy : number;
    if (vertical) {
        fromx = location.x
        tox = location.x;
        fromy = location.y
        toy = location.y + width;
    } else {
        fromx = location.x
        tox = location.x + width
        fromy = location.y
        toy = location.y;
    }

    //Draw arrow
    let headlen = 10;
    let dx = tox - fromx;
    let dy = toy - fromy;
    let angle = Math.atan2(dy, dx);
    ctx.beginPath()
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(fromx + headlen * Math.cos(angle - Math.PI / 6), fromy + headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(fromx + headlen * Math.cos(angle + Math.PI / 6), fromy + headlen * Math.sin(angle + Math.PI / 6));
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy); 
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();

    //Draw label
    ctx.save(); //Gonna set the anchor point, so save the old one
    let textwidth = ctx.measureText(actualwidth + "mm").width / 2 //Measure width of text to align in center
    if (vertical) {
        ctx.translate(location.x + dx * 0.5 - 5, location.y + dy * 0.5 + textwidth);
        ctx.rotate(angle - Math.PI);
    } else {
        ctx.translate(location.x + dx * 0.5 - textwidth, location.y + dy * 0.5 - 5);
        ctx.rotate(angle);
    }
    ctx.fillText(actualwidth + "mm", 0, 0);
    ctx.restore();
}

/**
 * Find the coordinate to start drawing, so that the content ends up centered
 * @param width Width of content
 * @param height Height of content
 */
function findStartingCoordinates(width: number, height: number) : Coordinate {
    let h = (ctx.canvas.height / 2) - (height / 2);
    let w = (ctx.canvas.width / 2) - (width / 2);

    return {x: w, y: h};
}

function translateToPixels(width : number, height : number, pad : number) : Coordinate {
    let ratio = height / width;
    
    let c = {x: 0, y:0};
    if (height > width) {
        c.y = ctx.canvas.height - pad;
        c.x = (width * c.y) / height;
    } else {
        c.x = ctx.canvas.width - pad;
        c.y = c.x * ratio;
    }
    if (c.x > ctx.canvas.width - 150 || c.y > ctx.canvas.height - 100) {
        return translateToPixels(width, height, pad + 125);
    }
    return c;
}