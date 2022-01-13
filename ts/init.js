import { drawWithParameters } from "./draw";
export var ctx;
export var sink_enabled = true;
export var tapholes = [];
window.onload = function () {
    var canvas = document.getElementById("surface_drawing");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;
    ctx.strokeStyle = 'black';
    ctx.font = "30px Arial";
    document.getElementById("draw_button").addEventListener("click", function () {
        var params = collectParameters();
        drawWithParameters(params.surfacewidth, params.surfaceheight, params.sinkheight, params.sinkwidth, params.sinkx, params.sinky);
    });
    document.getElementById('switch_sink').addEventListener("click", function (e) {
        if (e.target.selected) {
            sink_enabled = true;
            document.getElementById("sink_width").disabled = false;
            document.getElementById("sink_height").disabled = false;
            document.getElementById("sink_depth").disabled = false;
            document.getElementById("sink_x").disabled = false;
            document.getElementById("sink_y").disabled = false;
            document.getElementById("tap_hole_button").disabled = false;
        }
        else {
            sink_enabled = false;
            document.getElementById("sink_width").disabled = true;
            document.getElementById("sink_height").disabled = true;
            document.getElementById("sink_depth").disabled = true;
            document.getElementById("sink_x").disabled = true;
            document.getElementById("sink_y").disabled = true;
            document.getElementById("tap_hole_button").disabled = true;
        }
    });
    document.getElementById("tap_hole_button").addEventListener("click", function () {
        populateTapHoleDialog();
        document.getElementById("tap_hole_dialog").open = true;
    });
    document.getElementById("add_tap_hole").addEventListener("click", function () {
        var hole = {
            x: parseInt(document.getElementById("tap_hole_x").value),
            y: parseInt(document.getElementById("tap_hole_y").value),
            diameter: parseInt(document.getElementById("tap_hole_diameter").value)
        };
        tapholes.push(hole);
        document.getElementById("tap_hole_dialog").open = false;
    });
};
function collectParameters() {
    var o = {
        surfacewidth: 0,
        surfaceheight: 0,
        surfacethickness: 0,
        sinkwidth: 0,
        sinkheight: 0,
        sinkdepth: 0,
        sinkx: 0,
        sinky: 0
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
function populateTapHoleDialog() {
    var list = document.getElementById("tap_hole_list");
    list.innerHTML = "";
    for (var i = 0; i < tapholes.length; i++) {
        var t = tapholes[i];
        var btn = document.createElement("mwc-button");
        btn.setAttribute("outlined", "true");
        btn.setAttribute("icon", "delete");
        btn.setAttribute("label", t.x + "," + t.y + "," + t.diameter + "mm");
        btn.setAttribute("index", i.toString());
        btn.addEventListener("click", function (event) {
            var index = parseInt(event.target.getAttribute("index"));
            tapholes.splice(index, 1);
            populateTapHoleDialog();
        });
        list.appendChild(btn);
    }
}