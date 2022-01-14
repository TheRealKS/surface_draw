import { ctx, sink_enabled, tapholes } from "./init";
export var Perspective;
(function (Perspective) {
    Perspective[Perspective["TOP"] = 0] = "TOP";
    Perspective[Perspective["SIDE"] = 1] = "SIDE";
    Perspective[Perspective["FRONT"] = 2] = "FRONT";
})(Perspective || (Perspective = {}));
var hRatio, wRatio;
export function drawWithParameters(width, height, thickness, sink_height, sink_width, sink_depth, sink_x, sink_y, perspective) {
    //Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (perspective == Perspective.TOP) {
        drawTopPerspective(width, height, sink_height, sink_width, sink_x, sink_y);
    }
    else if (perspective == Perspective.SIDE) {
        drawSidePerspective(height, thickness, sink_depth, sink_height, sink_y);
    }
    else {
        drawFrontPerspective(width, thickness, sink_depth, sink_width, sink_x);
    }
}
function drawTopPerspective(width, height, sink_height, sink_width, sink_x, sink_y) {
    //Translate absolute measurement values to pixels
    var m = translateToPixels(width, height, 150);
    var pwidth = m.x;
    var pheight = m.y;
    computeRatiosTop(width, height, pwidth, pheight);
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
    drawStraightMeasurementArrow(altcoords, pheight, height, { vertical: true, bigtext: true });
    //Since everything we're drawing from now on is relative to the surface, set the anchor point
    ctx.save();
    ctx.translate(coords.x, coords.y);
    if (sink_enabled) {
        //Draw sink
        var sinkcoords = scaleCoord({ x: sink_x, y: sink_y });
        var sinksize = scaleCoord({ x: sink_width, y: sink_height });
        var s_pwidth = sinksize.x;
        var s_pheight = sinksize.y;
        ctx.beginPath();
        ctx.rect(sinkcoords.x, sinkcoords.y, s_pwidth, s_pheight);
        ctx.stroke();
        //Draw measurements of sink
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.y += 15 + s_pheight;
        drawStraightMeasurementArrow(altcoords, s_pwidth, sink_width, { bigtext: false, textbelow: true });
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.x -= 15;
        drawStraightMeasurementArrow(altcoords, s_pheight, sink_height, { vertical: true, bigtext: false, textbelow: false });
        //Draw measurements of sink relative to surface
        altcoords = Object.assign(altcoords, sinkcoords);
        //If there are tapholes, do not draw the arrow directly above surface
        if (tapholes.length > 0) {
            //Draw dotted line away from sink
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(altcoords.x + s_pwidth, altcoords.y);
            ctx.lineTo(altcoords.x + s_pwidth + 50, altcoords.y);
            ctx.stroke();
            ctx.setLineDash([]);
            altcoords.x += (s_pwidth + 50);
            altcoords.y = 0;
            drawStraightMeasurementArrow(altcoords, sinkcoords.y, sink_y, { bigtext: false, vertical: true, forcetexthorizontal: true });
            altcoords.x = sinkcoords.x + (s_pwidth / 2);
        }
        else {
            altcoords.x += (s_pwidth / 2);
            altcoords.y = 0;
            drawStraightMeasurementArrow(altcoords, sinkcoords.y, sink_y, { bigtext: false, vertical: true, forcetexthorizontal: true });
        }
        altcoords.x += (s_pwidth / 2);
        altcoords.y = sinkcoords.y + (s_pheight / 2);
        var arrlength = pwidth - altcoords.x;
        var actuallength = width - sink_x - sink_width;
        drawStraightMeasurementArrow(altcoords, arrlength, actuallength, { bigtext: false });
        //Draw tap holes
        for (var i = 0; i < tapholes.length; i++) {
            var t = tapholes[i];
            var hole = scaleTapHole(t);
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.diameter / 2, 0, 2 * Math.PI);
            ctx.stroke();
            //Draw measurement of tap hole
            if (i == 0) {
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(hole.x, hole.y);
                ctx.lineTo(hole.x - hole.diameter * 2, hole.y);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.font = "12px Arial";
                var toffset = ctx.measureText("ø" + t.diameter + "mm").width;
                ctx.fillText("ø" + t.diameter + "mm", hole.x - hole.diameter * 2 - toffset - 5, hole.y + 3);
            }
        }
    }
    //Restore context for next draw
    ctx.restore();
}
function drawSidePerspective(height, thickness, sink_depth, sink_height, sink_y) {
    //Translate absolute values to pixels
    var fthickness = thickness + sink_depth; //Sink depth needs to be included in height of figure
    var m = translateToPixels(height, fthickness, 300);
    var pwidth = m.x;
    var pheight = m.y;
    computeRatios(height, fthickness, pwidth, pheight);
    //Draw outline of surface (side perspective, so width = height, and thickness is height of rect)
    ctx.beginPath();
    var coords = findStartingCoordinates(pwidth, pheight);
    var surface_size = scaleCoord({ x: height, y: thickness });
    var surface_pwidth = pwidth;
    var surface_pheight = surface_size.y;
    ctx.rect(coords.x, coords.y, surface_pwidth, surface_pheight);
    ctx.stroke();
    //Draw measurements
    var altcoords = { x: 0, y: 0 };
    altcoords = Object.assign(altcoords, coords);
    altcoords.y -= 15;
    drawStraightMeasurementArrow(altcoords, surface_pwidth, height);
    altcoords = Object.assign(altcoords, coords);
    altcoords.x -= 15;
    //Thickness is usually a great magnitude smaller than other dimensions, so arrow will likely be small; use horizontal text
    drawStraightMeasurementArrow(altcoords, surface_pheight, thickness, { vertical: true, bigtext: false, forcetexthorizontal: true });
    //Since everything we're drawing from now on is relative to the surface, set the anchor point
    ctx.save();
    ctx.translate(coords.x, coords.y);
    //Draw sink
    if (sink_enabled) {
        var s_height = sink_depth - thickness;
        var sinkx = sink_y * wRatio;
        var sinky = surface_pheight;
        var sinksize = scaleCoord({ x: sink_height, y: s_height });
        var s_pwidth = sinksize.x;
        var s_pheight = sinksize.y;
        ctx.beginPath();
        ctx.moveTo(sinkx, sinky);
        ctx.lineTo(sinkx, s_pheight);
        ctx.lineTo(sinkx + s_pwidth, s_pheight);
        ctx.lineTo(sinkx + s_pwidth, sinky);
        ctx.stroke();
        //Draw sink depth measurement (relative to surface bottom)
        var sinkcoords = { x: sinkx, y: sinky };
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.y += 15 + s_pheight - sinky;
        drawStraightMeasurementArrow(altcoords, s_pwidth, sink_height, { bigtext: false, textbelow: true });
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.x -= 15;
        drawStraightMeasurementArrow(altcoords, s_pheight - sinky, s_height, { vertical: true, bigtext: false, textbelow: false });
        //Draw sink offset measurement
    }
    ctx.restore();
}
function drawFrontPerspective(width, thickness, sink_depth, sink_width, sink_y) {
    drawSidePerspective(width, thickness, sink_depth, sink_width, sink_y);
}
/**
 * Draw a measurement arrow with label. Location is the upper right hand based.
 * @param location Coord to start drawing the arrow at
 * @param width Size of arrow
 * @param actualwidth Width to display in label
 * @param vertical Arrow vertical or not
 */
function drawStraightMeasurementArrow(location, width, actualwidth, options) {
    if (options === void 0) { options = {
        vertical: false,
        bigtext: true,
        textbelow: false,
        forcetexthorizontal: false
    }; }
    //Quick mafs to get good coords
    var fromx, tox, fromy, toy;
    if (options.vertical) {
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
    var textheight = 0;
    if (options.bigtext) {
        ctx.font = "30px Arial";
        textheight = 30;
    }
    else {
        ctx.font = "15px Arial";
        textheight = 15;
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
    var textsize = ctx.measureText(actualwidth + "mm"); //Measure width of text to align in center
    var textwidth = textsize.width / 2;
    if (options.vertical) {
        if (options.forcetexthorizontal) {
            ctx.translate(location.x + dx * 0.5 - 5 - (textwidth * 2), location.y + dy * 0.5 + (textheight / 2));
            ctx.rotate(angle - 0.5 * Math.PI);
        }
        else {
            ctx.translate(location.x + dx * 0.5 - 5, location.y + dy * 0.5 + textwidth);
            ctx.rotate(angle - Math.PI);
        }
    }
    else {
        ctx.translate(location.x + dx * 0.5 - textwidth, location.y + dy * 0.5 - 5);
        ctx.rotate(angle);
    }
    if (options.textbelow) {
        ctx.fillText(actualwidth + "mm", 0, 20);
    }
    else {
        ctx.fillText(actualwidth + "mm", 0, 0);
    }
    ctx.restore();
}
function scaleTapHole(hole) {
    var h = Object.assign({}, hole);
    h.x *= wRatio;
    h.y *= hRatio;
    h.diameter *= wRatio;
    return h;
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
function scaleCoord(c) {
    var ac = Object.assign({ x: 0, y: 0 }, c);
    ac.x *= wRatio;
    ac.y *= hRatio;
    return ac;
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
function computeRatiosTop(w, h, pw, ph) {
    if (w > pw) {
        wRatio = pw / w;
    }
    else {
        wRatio = w / pw;
    }
    if (h > ph) {
        hRatio = ph / h;
    }
    else {
        hRatio = h / ph;
    }
}
function computeRatios(w, h, pw, ph) {
    if (w < pw) {
        wRatio = pw / w;
    }
    else {
        wRatio = w / pw;
    }
    if (h < ph) {
        hRatio = ph / h;
    }
    else {
        hRatio = h / ph;
    }
}
