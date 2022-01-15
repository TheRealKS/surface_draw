import { DrawingParameters, loadLayoutUI, setSaved } from './init'

export function saveLayout(layout : DrawingParameters) {
    let j = JSON.stringify(layout);

    fetch("server/save.php?d=" + j)
    .then(res => {
        if (res.ok) {
            return res.text();
        }
    })
    .then(res => {
        if (res == "OK") {
            document.getElementById("save_button").setAttribute("icon", "cloud_done");
            setSaved(true);
        } else {
            alert("Error: " + res);
        }
    })
}

export function loadLayout(id : string) {
    fetch("server/load.php?id="  + id)
    .then(res => {
        if (res.ok) {
            return res.json();
        }
    })
    .then(layout => {
        if (layout.error) {
            alert(layout.error);
        } else {
            loadLayoutUI(<DrawingParameters>layout);
        }
    })
}

export async function loadHistory() {
    let res = await fetch("server/gethistory.php")
    if (res.ok) {
        let d = await res.json();
        return <Array<DrawingParameters>>d;
    } else {
        alert("Error");
    }
    return undefined;
}

export function deleteAll() {
    fetch("server/deleteall.php").then(res => {
        if (res.ok) {
            return res.text();
        }
    })
    .then(text => {
        alert(text);
    });
}