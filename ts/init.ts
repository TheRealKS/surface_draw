import { DrawingSettings, drawWithParameters, Perspective } from "./draw";
import { loadLayout, saveLayout } from "./io";

export var ctx : CanvasRenderingContext2D;
export var sink_enabled = true;
export var tapholes_enabled = true;
export var sinks : Array<Sink>  = [];
export var tapholes : Array<TapHole> = [];
var saved = false;
var dialogedit = false;

var params : DrawingParameters;

export interface TapHole {
    x : number,
    y : number, 
    diameter : number
}

export interface Sink {
    x : number,
    y : number,
    height : number,
    width : number,
    depth : number
}

export interface DrawingParameters {
    surfacewidth : number,
    surfaceheight : number,
    surfacethickness : number,
    sinkenabled : boolean,
    sinkwidth : number,
    sinkheight : number,
    sinkdepth : number,
    sinkx : number,
    sinky : number,
    settings : DrawingSettings,
    tapholes : Array<TapHole>
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
        drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, params.settings, Perspective.TOP);
        document.getElementById("save_button").setAttribute("icon", "save");
        setSaved(false);
    });

    document.getElementById('switch_sink').addEventListener("click", function(e) {
        if (e.target.selected) {
            sink_enabled = true;
            document.getElementById("add_sink").disabled = false;
        } else {
            sink_enabled = false;
            document.getElementById("add_sink").disabled = true;
        }
    });

    document.getElementById("switch_tapholes").addEventListener("click", function(e) {
        if (e.target.selected) {
            tapholes_enabled = true;
            document.getElementById("add_taphole").disabled = false;
        } else {
            tapholes_enabled = false;
            document.getElementById("add_taphole").disabled = true;
        }
    });

    document.getElementById("add_sink").addEventListener("click", function() {
        document.getElementById("sink_dialog").open = true;
    });

    document.getElementById("add_taphole").addEventListener("click", function() {
        document.getElementById("tap_hole_dialog").open = true;
    });

    document.getElementById("add_sink_btn").addEventListener("click", function() {
        let sink : Sink = {
            x: parseInt(document.getElementById("sink_x").value),
            y: parseInt(document.getElementById("sink_y").value),
            height: parseInt(document.getElementById("sink_height").value),
            width: parseInt(document.getElementById("sink_width").value),
            depth: parseInt(document.getElementById("sink_depth").value)
        }
        if (dialogedit) {
            sinks[parseInt(document.getElementById("sink_dialog").getAttribute("edit"))] = sink;
            document.getElementById("add_sink_btn").setAttribute("label", "Toevoegen");
            dialogedit = false;
        } else {
            sinks.push(sink);
        }
        populateSinkList();
        document.getElementById("sink_dialog").open = false;
    });

    document.getElementById("add_tap_hole").addEventListener("click", function() {
        let hole : TapHole = {
            x: parseInt(document.getElementById("tap_hole_x").value),
            y: parseInt(document.getElementById("tap_hole_y").value),
            diameter: parseInt(document.getElementById("tap_hole_diameter").value)
        }; 
        if (dialogedit) {
            tapholes[parseInt(document.getElementById("tap_hole_dialog").getAttribute("edit"))] = hole;
            document.getElementById("add_tap_hole").setAttribute("label", "Toevoegen");
            dialogedit = false;
        } else {
            tapholes.push(hole);
        }
        populateTapHoleList();
        document.getElementById("tap_hole_dialog").open = false;
    });

    document.getElementById("p_top").addEventListener("click", function() {
        if (params) {
            drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, params.settings, Perspective.TOP);
        }
    });
    document.getElementById("p_side").addEventListener("click", function() {
        if (params) {
            drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, params.settings, Perspective.SIDE);
        }
    });
    document.getElementById("p_front").addEventListener("click", function() {
        if (params) {
            drawWithParameters(params.surfacewidth, params.surfaceheight, params.surfacethickness, params.sinkheight, params.sinkwidth, params.sinkdepth, params.sinkx, params.sinky, params.settings, Perspective.FRONT);
        }
    });

    document.getElementById("download_button").addEventListener("click", function() {
        let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("surface_drawing");
        fillAlpha(ctx, 'white');
        var anchor = document.createElement("a");
        anchor.href = canvas.toDataURL("image/png");
        anchor.download = "werkblad.png";
        anchor.click();
    });

    document.getElementById("save_button").addEventListener("click", function() {
        if (!saved && params) {
            saveLayout(params);
        }
    });

    document.getElementById("history").addEventListener("click", function () {
        window.location.href = "history.html";
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("id")) {
        loadLayout(urlParams.get("id"));
    }
};

function fillAlpha(ctx, bgColor){  // bgColor is a valid CSS color ctx is 2d context
    // save state
    ctx.save();
    // make sure defaults are set
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";
 
    // fill transparent pixels with bgColor
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 
    // cleanup
    ctx.restore();
 }

function collectParameters() : DrawingParameters {
    let o : DrawingParameters = {
        surfacewidth: 0,
        surfaceheight: 0,
        surfacethickness: 0,
        sinkenabled: true,
        sinkwidth: 0,
        sinkheight: 0,
        sinkdepth: 0,
        sinkx: 0,
        sinky: 0,
        settings: undefined,
        tapholes: []
    };
    o.surfacewidth = parseInt(document.getElementById("field_width").value);
    o.surfaceheight = parseInt(document.getElementById("field_height").value);
    o.surfacethickness = parseInt(document.getElementById("field_thickness").value);
    o.sinkenabled = sink_enabled;
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
    let t = document.getElementById("pic_title").value;
    if (t != "") {
        s.title = t;
        document.getElementById("page_title").innerHTML = "Werkblad - " + t;
    }
    o.settings = s;
    o.tapholes = tapholes;

    return o;
}

function populateSinkDialog(sink : Sink) {
    document.getElementById("sink_x").value = sink.x;
    document.getElementById("sink_y").value = sink.y;
    document.getElementById("sink_height").value = sink.height;
    document.getElementById("sink_width").value = sink.width;
    document.getElementById("sink_depth").value = sink.depth;
}

function populateSinkList() {
    document.getElementById("sink_list").innerHTML = "";
    for (var i = 0; i < sinks.length; i++) {
        let holder = document.createElement("mwc-list-item");
        holder.className = "list_item";
        var sink = sinks[i];
        let data = document.createElement("span");
        data.className = "list_item_text";
        data.innerHTML = sink.x + "," + sink.y + " - " + sink.width + "x" + sink.height + "x" + sink.depth;
        let bttn = document.createElement("mwc-icon-button")
        bttn.setAttribute("icon", "edit");
        bttn.addEventListener("click", function() {
            populateSinkDialog(sinks[this])
            document.getElementById("add_sink_btn").setAttribute("label", "Bewerken");
            document.getElementById("sink_dialog").setAttribute("edit", this.toString());
            dialogedit = true;
            document.getElementById("sink_dialog").open = true;
        }.bind(i));
        let bttn2 = document.createElement("mwc-icon-button");
        bttn2.setAttribute("icon", "delete")
        bttn2.addEventListener("click", function() {
            sinks.splice(this);
            populateSinkList();
        }.bind(i));
        holder.appendChild(data);
        holder.appendChild(bttn);
        holder.appendChild(bttn2);
        document.getElementById("sink_list").appendChild(holder);
    }
}

function populateTapHoleDialog(hole : TapHole) {
    document.getElementById("tap_hole_x").value = hole.x;
    document.getElementById("tap_hole_y").value = hole.y;
    document.getElementById("tap_hole_diameter").value = hole.diameter;
}

function populateTapHoleList() {
    var list = document.getElementById("tap_hole_list");
    list.innerHTML = "";
    for (var i = 0; i < tapholes.length; i++) {
        let t = tapholes[i];
        let item = document.createElement("mwc-list-item");
        item.className = "list_item";
        let label = document.createElement("span");
        label.className = "list_item_text";
        label.innerHTML = t.x + "," + t.y + "," + t.diameter + "mm";
        let edit_btn = document.createElement("mwc-icon-button");
        edit_btn.setAttribute("icon", "edit");
        edit_btn.setAttribute("index", i.toString());
        let delete_btn = document.createElement("mwc-icon-button");
        delete_btn.setAttribute("icon", "delete");
        delete_btn.setAttribute("index", i.toString());
        item.appendChild(label);
        item.appendChild(edit_btn);
        item.appendChild(delete_btn);

        edit_btn.addEventListener("click", function(event) {
            populateTapHoleDialog(tapholes[this]);  
            document.getElementById("add_tap_hole").setAttribute("label", "Bewerken");
            document.getElementById("tap_hole_dialog").setAttribute("edit", this.toString());
            dialogedit = true;
            document.getElementById("tap_hole_dialog").open = true;
        }.bind(i));

        delete_btn.addEventListener("click", function(event) {
            tapholes.splice(this, 1);
            populateTapHoleList();
        }.bind(i));
        list.appendChild(item);
    }
}

export function setSaved(val : boolean) {
    saved = val;
}

export function loadLayoutUI(l : DrawingParameters) {
    document.getElementById("field_width").value = l.surfacewidth;
    document.getElementById("field_height").value = l.surfaceheight;
    document.getElementById("field_thickness").value = l.surfacethickness;
    let s = document.getElementById('switch_sink');
    if (s.selected != l.sinkenabled) {
        s.click();
    }
    if (sink_enabled) {
        document.getElementById("sink_width").value = l.sinkwidth;
        document.getElementById("sink_height").value = l.sinkheight;
        document.getElementById("sink_depth").value = l.sinkdepth;
        document.getElementById("sink_x").value = l.sinkx;
        document.getElementById("sink_y").value = l.sinky;
    } else {
        document.getElementById("sink_width").value = "";
        document.getElementById("sink_height").value = "";
        document.getElementById("sink_depth").value = "";
        document.getElementById("sink_x").value = "";
        document.getElementById("sink_y").value = "";
    }
    document.getElementById("draw_m_surface").selected = l.settings.draw_surface_measurements;
    document.getElementById("draw_m_sink").selected = l.settings.draw_sink_measurements;
    document.getElementById("draw_m_taphole").selected = l.settings.draw_tap_hole_measurements;
    document.getElementById("diff_m_color").selected = l.settings.measurement_diff_color;
    if (l.settings.title) {
        document.getElementById("pic_title").value = l.settings.title;
        document.getElementById("page_title").innerHTML = "Werkblad - " + l.settings.title;
    }
    tapholes = l.tapholes;
    params = l;

    document.getElementById("draw_button").click();
} 