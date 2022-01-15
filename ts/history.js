import { deleteAll, loadHistory } from "./io";
window.onload = function () {
    document.getElementById("back").addEventListener("click", function () {
        window.location.href = "/";
    });
    document.getElementById("delete_all").addEventListener("click", function () {
        if (confirm("Alles verwijderen?") == true) {
            deleteAll();
        }
    });
    loadHistoryUI();
};
function loadHistoryUI() {
    loadHistory().then(function (arr) {
        var list = document.getElementById("history_list");
        for (var i = 0; i < arr.length; i++) {
            var element = createHistoryListElement(arr[i]);
            element.addEventListener("click", function () {
                window.location.href = "/?id=" + i;
            });
            list.appendChild(element);
        }
    });
}
function createHistoryListElement(layout) {
    var holder = document.createElement("div");
    holder.className = "history_entry";
    var title = document.createElement("span");
    title.className = "history_entry_title";
    title.innerHTML = "Werkblad";
    if (layout.settings.title) {
        title.innerHTML = layout.settings.title;
    }
    var detail1 = createHistoryEntryDetail(layout.surfacewidth + "x" + layout.surfaceheight + "x" + layout.surfacethickness);
    var detail2 = createHistoryEntryDetail("Geen wasbak");
    if (layout.sinkenabled) {
        detail2.innerHTML = "Wasbak " + layout.sinkwidth + "x" + layout.sinkheight + "x" + layout.sinkdepth;
    }
    holder.appendChild(title);
    holder.appendChild(detail1);
    holder.appendChild(detail2);
    return holder;
}
function createHistoryEntryDetail(text) {
    var d = document.createElement("span");
    d.className = "history_entry_detail";
    d.innerHTML = text;
    return d;
}
