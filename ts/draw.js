import { ctx } from "./init";
export function drawWithParameters(width, height, sink_height, sink_width, sink_x, sink_y) {
    //Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //Translate absolute measurement values to pixels
    var m = translateToPixels(width, height, 150);
    var pwidth = m.x;
    var pheight = m.y;
    //Draw outline of surface
    ctx.beginPath();
    var coords = findStartingCoordinates(pwidth, pheight);
    ctx.rect(coords.x, coords.y, pwidth, pheight);
    ctx.stroke();
    //Draw measurements of outline
    var altcoords = { x: 0, y: 0 };
    altcoords = Object.assign(altcoords, coords);
    altcoords.y -= 15;
    drawStraightMeasurementArrow(altcoords, pwidth, width);
    altcoords = Object.assign(altcoords, coords);
    altcoords.x -= 15;
    drawStraightMeasurementArrow(altcoords, pheight, height, true);
    //Draw sink
    ctx.beginPath();
    var sinkcoords = findSinkCoords(coords, sink_x, sink_y);
    sinkcoords = translateSinkCoordsToPixels(sinkcoords, pwidth);
    var sinksize = translateSinkToPixels(pwidth, sink_width, sink_height);
    var s_pwidth = sinksize.x;
    var s_pheight = sinksize.y;
    ctx.rect(sinkcoords.x, sinkcoords.y, s_pwidth, s_pheight);
    ctx.stroke();
    //Draw measurements of sink
    altcoords = Object.assign(altcoords, sinkcoords);
    altcoords.y += 15 + s_pheight;
    drawStraightMeasurementArrow(altcoords, s_pwidth, sink_width, false, false, true);
    altcoords = Object.assign(altcoords, sinkcoords);
    altcoords.x -= 15;
    drawStraightMeasurementArrow(altcoords, s_pheight, sink_height, true, false);
}
/**
 * Draw a measurement arrow with label. Location is the upper right hand based.
 * @param location Coord to start drawing the arrow at
 * @param width Size of arrow
 * @param actualwidth Width to display in label
 * @param vertical Arrow vertical or not
 */
function drawStraightMeasurementArrow(location, width, actualwidth, vertical, big, below) {
    if (vertical === void 0) { vertical = false; }
    if (big === void 0) { big = true; }
    if (below === void 0) { below = false; }
    //Quick mafs to get good coords
    var fromx, tox, fromy, toy;
    if (vertical) {
        fromx = location.x;
        tox = location.x;
        fromy = location.y;
        toy = location.y + width;
    }
    else {
        fromx = location.x;
        tox = location.x + width;
        fromy = location.y;
        toy = location.y;
    }
    //Set font size
    if (big) {
        ctx.font = "30px Arial";
    }
    else {
        ctx.font = "15px Arial";
    }
    //Draw arrow
    var headlen = 10;
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    ctx.beginPath();
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
    var textwidth = ctx.measureText(actualwidth + "mm").width / 2; //Measure width of text to align in center
    if (vertical) {
        ctx.translate(location.x + dx * 0.5 - 5, location.y + dy * 0.5 + textwidth);
        ctx.rotate(angle - Math.PI);
    }
    else {
        ctx.translate(location.x + dx * 0.5 - textwidth, location.y + dy * 0.5 - 5);
        ctx.rotate(angle);
    }
    if (below) {
        ctx.fillText(actualwidth + "mm", 0, 20);
    }
    else {
        ctx.fillText(actualwidth + "mm", 0, 0);
    }
    ctx.restore();
}
function findSinkCoords(surfacecoords, x, y) {
    var c = { x: 0, y: 0 };
    c = Object.assign(c, surfacecoords);
    c.x += x;
    c.y += y;
    return c;
}
/**
 * Find the coordinate to start drawing, so that the content ends up centered
 * @param width Width of content
 * @param height Height of content
 */
function findStartingCoordinates(width, height) {
    var h = (ctx.canvas.height / 2) - (height / 2);
    var w = (ctx.canvas.width / 2) - (width / 2);
    return { x: w, y: h };
}
function translateSinkCoordsToPixels(sinkcoords, width) {
    var ratio = sinkcoords.x / width;
    sinkcoords.x *= ratio;
    sinkcoords.y *= ratio;
    return sinkcoords;
}
function translateSinkToPixels(width, swidth, sheight) {
    //Scale sink to fit in surface
    var c = { x: 0, y: 0 };
    var ratio = swidth / width;
    c.x = swidth * ratio;
    c.y = sheight * ratio;
    return c;
}
function translateToPixels(width, height, pad) {
    var ratio = height / width;
    var c = { x: 0, y: 0 };
    if (height > width) {
        c.y = ctx.canvas.height - pad;
        c.x = (width * c.y) / height;
    }
    else {
        c.x = ctx.canvas.width - pad;
        c.y = c.x * ratio;
    }
    if (c.x > ctx.canvas.width - 150 || c.y > ctx.canvas.height - 100) {
        return translateToPixels(width, height, pad + 125);
    }
    return c;
}
