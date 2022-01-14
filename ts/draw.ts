import { ctx, sink_enabled, TapHole, tapholes } from "./init";

export enum Perspective {
    TOP,
    SIDE,
    FRONT
}

export interface DrawingSettings {
    draw_surface_measurements : boolean,
    draw_sink_measurements : boolean,
    draw_tap_hole_measurements : boolean,
    measurement_diff_color : boolean
}

interface Coordinate {
    x : number, 
    y : number
}

interface MeasurementArrowOptions {
    vertical? : boolean,
    bigtext? : boolean,
    textbelow? : boolean,
    forcetexthorizontal? : boolean
}

var hRatio, wRatio;

export function drawWithParameters(
    width : number,
    height: number,
    thickness: number,
    sink_height : number,
    sink_width : number,
    sink_depth : number,
    sink_x : number,
    sink_y : number,
    perspective : Perspective) {
        //Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (perspective == Perspective.TOP) {
            drawTopPerspective(width, height, sink_height, sink_width, sink_x, sink_y);
        } else if (perspective == Perspective.SIDE) {
            drawSidePerspective(height, thickness, sink_depth, sink_height, sink_y);
        } else {
            drawFrontPerspective(width, thickness, sink_depth, sink_width, sink_x);
        }
}

function drawTopPerspective(
    width : number,
    height: number,
    sink_height : number,
    sink_width : number,
    sink_x : number,
    sink_y : number) {
        //Translate absolute measurement values to pixels
        let m = translateToPixels(width, height, 150);
        let pwidth = m.x;
        let pheight = m.y;
        computeRatiosTop(width, height, pwidth, pheight);

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
        drawStraightMeasurementArrow(altcoords, pheight, height, {vertical: true, bigtext: true});

        //Since everything we're drawing from now on is relative to the surface, set the anchor point
        ctx.save()
        ctx.translate(coords.x, coords.y);

        if (sink_enabled) {
            //Draw sink
            let sinkcoords = scaleCoord({x:sink_x, y:sink_y})
            let sinksize = scaleCoord({x:sink_width, y:sink_height});
            let s_pwidth = sinksize.x;
            let s_pheight = sinksize.y;
            ctx.beginPath();    
            ctx.rect(sinkcoords.x, sinkcoords.y, s_pwidth, s_pheight);
            ctx.stroke();

            //Draw measurements of sink
            altcoords = Object.assign(altcoords, sinkcoords);
            altcoords.y += 15 + s_pheight;
            drawStraightMeasurementArrow(altcoords, s_pwidth, sink_width, {bigtext: false, textbelow: true});
            altcoords = Object.assign(altcoords, sinkcoords);
            altcoords.x -= 15
            drawStraightMeasurementArrow(altcoords, s_pheight, sink_height, {vertical: true, bigtext: false, textbelow: false});

            //Draw measurements of sink relative to surface
            altcoords = Object.assign(altcoords, sinkcoords);
            //If there are tapholes, do not draw the arrow directly above surface
            if (tapholes.length > 0) {
                //Draw dotted line away from sink
                ctx.beginPath();
                ctx.setLineDash([5,5]);
                ctx.moveTo(altcoords.x + s_pwidth, altcoords.y);
                ctx.lineTo(altcoords.x + s_pwidth + 50, altcoords.y);
                ctx.stroke();
                ctx.setLineDash([]);
                altcoords.x += (s_pwidth + 50);
                altcoords.y = 0;
                drawStraightMeasurementArrow(altcoords, sinkcoords.y, sink_y, {bigtext: false, vertical: true, forcetexthorizontal: true});
                altcoords.x = sinkcoords.x + (s_pwidth / 2);
            } else {
                altcoords.x += (s_pwidth / 2);
                altcoords.y = 0;
                drawStraightMeasurementArrow(altcoords, sinkcoords.y, sink_y, {bigtext: false, vertical: true, forcetexthorizontal: true});
            }
            altcoords.x += (s_pwidth / 2);
            altcoords.y = sinkcoords.y + (s_pheight / 2)
            let arrlength = pwidth - altcoords.x;
            let actuallength = width - sink_x - sink_width;
            drawStraightMeasurementArrow(altcoords, arrlength, actuallength, {bigtext: false});

            //Draw tap holes
            for (var i = 0; i < tapholes.length; i++) {
                let t = tapholes[i];
                let hole = scaleTapHole(t);
                ctx.beginPath();
                ctx.arc(hole.x, hole.y, hole.diameter / 2, 0, 2 * Math.PI);
                ctx.stroke();

                //Draw measurement of tap hole
                if (i == 0) {
                    ctx.beginPath();
                    ctx.setLineDash([5,5]);
                    ctx.moveTo(hole.x, hole.y);
                    ctx.lineTo(hole.x - hole.diameter * 2, hole.y);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.font = "12px Arial";
                    let toffset = ctx.measureText("ø" + t.diameter + "mm").width;
                    ctx.fillText("ø" + t.diameter + "mm", hole.x - hole.diameter * 2 - toffset - 5, hole.y + 3);    
                }
            }
        }
        //Restore context for next draw
        ctx.restore();  
}

function drawSidePerspective(height : number, thickness : number, sink_depth, sink_height, sink_y) {
    //Translate absolute values to pixels
    let fthickness = thickness + sink_depth; //Sink depth needs to be included in height of figure
    let m = translateToPixels(height, fthickness, 300); 
    let pwidth = m.x;
    let pheight = m.y;
    computeRatios(height, fthickness, pwidth, pheight);

    //Draw outline of surface (side perspective, so width = height, and thickness is height of rect)
    ctx.beginPath();
    let coords = findStartingCoordinates(pwidth, pheight);
    let surface_size = scaleCoord({x:height, y: thickness});
    let surface_pwidth = pwidth;
    let surface_pheight = surface_size.y;
    ctx.rect(coords.x, coords.y, surface_pwidth, surface_pheight);
    ctx.stroke();

    //Draw measurements
    let altcoords = {x:0, y:0};
    altcoords = Object.assign(altcoords, coords);
    altcoords.y -= 15
    drawStraightMeasurementArrow(altcoords, surface_pwidth, height);
    altcoords = Object.assign(altcoords, coords);
    altcoords.x -= 15
    //Thickness is usually a great magnitude smaller than other dimensions, so arrow will likely be small; use horizontal text
    drawStraightMeasurementArrow(altcoords, surface_pheight, thickness, {vertical: true, bigtext: false, forcetexthorizontal: true});

    //Since everything we're drawing from now on is relative to the surface, set the anchor point
    ctx.save()
    ctx.translate(coords.x, coords.y);

    //Draw sink
    if (sink_enabled) {
        let s_height = sink_depth - thickness;
        let sinkx = sink_y * wRatio;
        let sinky = surface_pheight;
        let sinksize = scaleCoord({x:sink_height, y:s_height});
        let s_pwidth = sinksize.x;
        let s_pheight = sinksize.y;
        ctx.beginPath();    
        ctx.moveTo(sinkx, sinky);
        ctx.lineTo(sinkx, s_pheight);
        ctx.lineTo(sinkx + s_pwidth, s_pheight);
        ctx.lineTo(sinkx + s_pwidth, sinky);
        ctx.stroke();

        //Draw sink depth measurement (relative to surface bottom)
        let sinkcoords = {x:sinkx, y:sinky};
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.y += 15 + s_pheight - sinky;
        drawStraightMeasurementArrow(altcoords, s_pwidth, sink_height, {bigtext: false, textbelow: true});
        altcoords = Object.assign(altcoords, sinkcoords);
        altcoords.x -= 15;
        drawStraightMeasurementArrow(altcoords, s_pheight - sinky, s_height, {vertical: true, bigtext: false, textbelow: false});

        //Draw sink offset measurement
        
    }

    ctx.restore();
}

function drawFrontPerspective(width : number, thickness: number, sink_depth : number, sink_width : number, sink_y : number) {
    drawSidePerspective(width, thickness, sink_depth, sink_width, sink_y);
}

/**
 * Draw a measurement arrow with label. Location is the upper right hand based.
 * @param location Coord to start drawing the arrow at 
 * @param width Size of arrow
 * @param actualwidth Width to display in label
 * @param vertical Arrow vertical or not
 */
function drawStraightMeasurementArrow(location : Coordinate, width : number, actualwidth: number, options : MeasurementArrowOptions = {
    vertical: false,
    bigtext : true,
    textbelow : false,
    forcetexthorizontal : false
}) {
    //Quick mafs to get good coords
    let fromx : number, tox : number, fromy : number, toy : number;
    if (options.vertical) {
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
    let textheight = 0;
    if (options.bigtext) {
        ctx.font = "30px Arial";
        textheight = 30;
    } else {
        ctx.font = "15px Arial";
        textheight = 15;
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
    let textsize : TextMetrics= ctx.measureText(actualwidth + "mm")//Measure width of text to align in center
    let textwidth = textsize.width / 2;
    if (options.vertical) {
        if (options.forcetexthorizontal) {
            ctx.translate(location.x + dx * 0.5 - 5 - (textwidth * 2), location.y + dy * 0.5 + (textheight / 2));
            ctx.rotate(angle - 0.5 * Math.PI);
        } else {
            ctx.translate(location.x + dx * 0.5 - 5, location.y + dy * 0.5 + textwidth);
            ctx.rotate(angle - Math.PI);
        }
    } else {
        ctx.translate(location.x + dx * 0.5 - textwidth, location.y + dy * 0.5 - 5);
        ctx.rotate(angle);
    }
    if (options.textbelow) {
        ctx.fillText(actualwidth + "mm", 0, 20);
    } else {
        ctx.fillText(actualwidth + "mm", 0, 0);
    }
    ctx.restore();
}

function scaleTapHole(hole : TapHole) {
    let h = Object.assign({}, hole);
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
function findStartingCoordinates(width: number, height: number) : Coordinate {
    let h = (ctx.canvas.height / 2) - (height / 2);
    let w = (ctx.canvas.width / 2) - (width / 2);

    return {x: w, y: h};
}

function scaleCoord(c : Coordinate) {
    let ac = Object.assign({x:0, y:0}, c);
    ac.x *= wRatio;
    ac.y *= hRatio;
    return ac;
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

function computeRatiosTop(w : number, h : number, pw : number, ph : number) {
    if (w > pw) {
        wRatio = pw / w;
    } else {
        wRatio = w / pw;
    }
    if (h > ph) {
        hRatio = ph / h;
    } else {
        hRatio = h / ph;
    }
}

function computeRatios(w : number, h : number, pw : number, ph : number) {
    if (w < pw) {
        wRatio = pw / w;
    } else {
        wRatio = w / pw;
    }
    if (h < ph) {
        hRatio = ph / h;
    } else {
        hRatio = h / ph;
    }
}