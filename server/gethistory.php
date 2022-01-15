<?php
    $files = scandir("../store");
    $layouts = [];
    foreach($files as $file) {
        if(is_file("../store/" . $file)) {
            $data = json_decode(file_get_contents("../store/" . $file));
            array_push($layouts, $data);
        }
    }
    echo(json_encode($layouts));
?>