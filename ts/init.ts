import { drawWithParameters } from "./draw";

export var ctx : CanvasRenderingContext2D;
export var sink_enabled = true;

interface DrawingParameters {
    surfacewidth : number,
    surfaceheight : number,
    surfacethickness : number,
    sinkwidth : number,
    sinkheight : number,
    sinkdepth : number,
    sinkx : number,
    sinky : number,
    tapholes : Array<any>
}

window.onload = function() {
    let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("surface_drawing");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
    ctx.strokeStyle = 'black';
    ctx.font = "30px Arial";

    document.getElementById("draw_button").addEventListener("click", () => {
        let params = collectParameters();
        drawWithParameters(params.surfacewidth, params.surfaceheight, params.sinkheight, params.sinkwidth, params.sinkx, params.sinky);
    })

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
        tapholes: []
    };
    o.surfacewidth = parseInt(document.getElementById("field_width").value);
    o.surfaceheight = parseInt(document.getElementById("field_height").value);
    o.surfacethickness = parseInt(document.getElementById("field_thickness").value);
    o.sinkheight = parseInt(document.getElementById("sink_width").value);
    o.sinkwidth = parseInt(document.getElementById("sink_height").value);
    o.sinkdepth = parseInt(document.getElementById("sink_depth").value);
    o.sinkx = parseInt(document.getElementById("sink_x").value);
    o.sinky = parseInt(document.getElementById("sink_y").value);
    return o;
}