import { DrawingSettings, drawWithParameters, Perspective } from "./draw";

export var ctx : CanvasRenderingContext2D;
export var sink_enabled = true;
export var tapholes : Array<TapHole> = [];

var params : DrawingParameters;

export interface TapHole {
    x : number,
    y : number, 
    diameter : number
}

interface DrawingParameters {
    surfacewidth : number,
    surfaceheight : number,
    surfacethickness : number,
    sinkwidth : number,
    sinkheight : number,
    sinkdepth : number,
    sinkx : number,
    sinky : number,
    settings : DrawingSettings
}

window.onload = function() {
    let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("surface_drawing");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
    ctx.strokeStyle = 'black';
    ctx.font = "30px Arial";

    document.getElementById("draw_button").addEventListener("click", () => {
        params = collectParameters();
        drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, Perspective.TOP);
    });

    document.getElementById('switch_sink').addEventListener("click", function(e) {
        if (e.target.selected) {
            sink_enabled = true;
            document.getElementById("sink_width").disabled = false;
            document.getElementById("sink_height").disabled = false;
            document.getElementById("sink_depth").disabled = false;
            document.getElementById("sink_x").disabled = false;
            document.getElementById("sink_y").disabled = false;
            document.getElementById("tap_hole_button").disabled = false;
        } else {
            sink_enabled = false;
            document.getElementById("sink_width").disabled = true;
            document.getElementById("sink_height").disabled = true;
            document.getElementById("sink_depth").disabled = true;
            document.getElementById("sink_x").disabled = true;
            document.getElementById("sink_y").disabled = true;
            document.getElementById("tap_hole_button").disabled = true;
        }
    });

    document.getElementById("tap_hole_button").addEventListener("click", function() {
        populateTapHoleDialog();
        document.getElementById("tap_hole_dialog").open = true;
    });

    document.getElementById("add_tap_hole").addEventListener("click", function() {
        let hole : TapHole = {
            x: parseInt(document.getElementById("tap_hole_x").value),
            y: parseInt(document.getElementById("tap_hole_y").value),
            diameter: parseInt(document.getElementById("tap_hole_diameter").value)
        }; 
        tapholes.push(hole);
        document.getElementById("tap_hole_dialog").open = false;
    });

    document.getElementById("p_top").addEventListener("click", function() {
        if (params) {
            drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, Perspective.TOP);
        }
    });
    document.getElementById("p_side").addEventListener("click", function() {
        if (params) {
            drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, Perspective.SIDE);
        }
    });
    document.getElementById("p_front").addEventListener("click", function() {
        if (params) {
            drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, Perspective.FRONT);
        }
    });
};

function collectParameters() : DrawingParameters {
    let o : DrawingParameters = {
        surfacewidth: 0,
        surfaceheight: 0,
        surfacethickness: 0,
        sinkwidth: 0,
        sinkheight: 0,
        sinkdepth: 0,
        sinkx: 0,
        sinky: 0,
        settings: undefined
    };
    o.surfacewidth = parseInt(document.getElementById("field_width").value);
    o.surfaceheight = parseInt(document.getElementById("field_height").value);
    o.surfacethickness = parseInt(document.getElementById("field_thickness").value);
    if (sink_enabled) {
        o.sinkheight = parseInt(document.getElementById("sink_width").value);
        o.sinkwidth = parseInt(document.getElementById("sink_height").value);
        o.sinkdepth = parseInt(document.getElementById("sink_depth").value);
        o.sinkx = parseInt(document.getElementById("sink_x").value);
        o.sinky = parseInt(document.getElementById("sink_y").value);
    }
    let s : DrawingSettings = {
        draw_surface_measurements: true,
        draw_sink_measurements: true,
        draw_tap_hole_measurements: false,
        measurement_diff_color: false
    };
    s.draw_surface_measurements = document.getElementById("draw_m_surface").selected;
    s.draw_sink_measurements = document.getElementById("draw_m_sink").selected;
    s.draw_tap_hole_measurements = document.getElementById("draw_m_taphole").selected;
    s.measurement_diff_color = document.getElementById("diff_m_color").selected;
    o.settings = s;

    return o;
}

function populateTapHoleDialog() {
    var list = document.getElementById("tap_hole_list");
    list.innerHTML = "";
    for (var i = 0; i < tapholes.length; i++) {
        let t = tapholes[i];
        let btn = document.createElement("mwc-button");
        btn.setAttribute("outlined", "true");
        btn.setAttribute("icon", "delete");
        btn.setAttribute("label", t.x + "," + t.y + "," + t.diameter + "mm");
        btn.setAttribute("index", i.toString());
        btn.addEventListener("click", function(event) {
            let index = parseInt(event.target.getAttribute("index"));
            tapholes.splice(index, 1);
            populateTapHoleDialog();
        })
        list.appendChild(btn);
    }
}