import { ctx, TapHole, tapholes } from "./init";

interface Coordinate {
    x : number, 
    y : number
}

export function drawWithParameters(
    width : number,
    height: number,
    sink_height : number,
    sink_width : number,
    sink_x : number,
    sink_y : number) {
        //Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

        //Draw sink
        ctx.beginPath();
        let sinkcoords = findSinkCoords(coords, sink_x, sink_y);
        sinkcoords = translateSinkCoordsToPixels(sinkcoords, pwidth);
        let sinksize = translateSinkToPixels(pwidth, sink_width, sink_height);
        let s_pwidth = sinksize.x;
        let s_pheight = sinksize.y;
        ctx.rect(sinkcoords.x, sinkcoords.y, s_pwidth, s_pheight);
        ctx.stroke();

        //Draw measurements of sink
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.y += 15 + s_pheight;
        drawStraightMeasurementArrow(altcoords, s_pwidth, sink_width, false, false, true);
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.x -= 15
        drawStraightMeasurementArrow(altcoords, s_pheight, sink_height, true, false);

        //Draw tap holes
        for (var t of tapholes) {
            let hole = transformTapHole(t, coords, pwidth);
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.diameter / 2, 0, 2 * Math.PI);
            ctx.stroke();
        }
}

/**
 * Draw a measurement arrow with label. Location is the upper right hand based.
 * @param location Coord to start drawing the arrow at 
 * @param width Size of arrow
 * @param actualwidth Width to display in label
 * @param vertical Arrow vertical or not
 */
function drawStraightMeasurementArrow(location : Coordinate, width : number, actualwidth: number, vertical = false, big = true, below = false) {
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

    //Set font size
    if (big) {
        ctx.font = "30px Arial";
    } else {
        ctx.font = "15px Arial";
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
    if (below) {
        ctx.fillText(actualwidth + "mm", 0, 20);
    } else {
        ctx.fillText(actualwidth + "mm", 0, 0);
    }
    ctx.restore();
}

function findSinkCoords(surfacecoords : Coordinate, x : number, y : number) : Coordinate {
    let c : Coordinate = {x:0,y:0};
    c = Object.assign(c, surfacecoords);
    c.x += x;
    c.y += y;
    return c;
}

function transformTapHole(hole : TapHole, surfacecoords : Coordinate, width : number) {
    hole.x += surfacecoords.x;
    hole.y += surfacecoords.y;
    let ratio = hole.x / width;
    hole.x *= ratio;
    hole.y *= ratio;
    ratio = hole.diameter / width;
    hole.diameter *= ratio;
    return hole;
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

function translateSinkCoordsToPixels(sinkcoords : Coordinate, width : number) : Coordinate {
    let ratio = sinkcoords.x / width;
    sinkcoords.x *= ratio;
    sinkcoords.y *= ratio;
    return sinkcoords;
}

function translateSinkToPixels(width : number, swidth : number, sheight : number) : Coordinate {
    //Scale sink to fit in surface
    let c = {x: 0, y:0};
    let ratio = swidth / width;
    c.x = swidth * ratio;
    c.y = sheight * ratio;
    return c;
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