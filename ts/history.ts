import { DrawingParameters, sink_enabled } from "./init";
import { deleteAll, loadHistory } from "./io";

window.onload = function() {
    document.getElementById("back").addEventListener("click", () => {
        window.location.href = "/werkblad";
    });
    document.getElementById("delete_all").addEventListener("click", () => {
        if (confirm("Alles verwijderen?") == true) {
            deleteAll();
        }
    });

    loadHistoryUI();
}

function loadHistoryUI() {
    loadHistory().then(arr => {
        var list = document.getElementById("history_list");
        for (var i = 0; i < arr.length; i++) {
            let element = createHistoryListElement(arr[i]);
            element.addEventListener("click", function() {
                window.location.href = "/werkblad?id=" + i;
            });
            list.appendChild(element);
        }
    })
}

function createHistoryListElement(layout : DrawingParameters) {
    let holder = document.createElement("div");
    holder.className = "history_entry";
    let title = document.createElement("span");
    title.className = "history_entry_title";
    title.innerHTML = "Werkblad";
    if (layout.settings.title) {
        title.innerHTML = layout.settings.title;
    }
    let detail1 = createHistoryEntryDetail(layout.surfacewidth + "x" + layout.surfaceheight + "x" + layout.surfacethickness);
    let detail2 = createHistoryEntryDetail("Geen wasbak");
    if (layout.sinkenabled) {
        detail2.innerHTML = "Wasbak " + layout.sinkwidth + "x" + layout.sinkheight + "x" + layout.sinkdepth;
    }
    holder.appendChild(title);
    holder.appendChild(detail1);
    holder.appendChild(detail2);
    
    return holder;
}

function createHistoryEntryDetail(text : string) {
    let d = document.createElement("span");
    d.className = "history_entry_detail";
    d.innerHTML = text;
    return d;
}