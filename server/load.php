<?php
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        header('Content-Type: application/json; charset=utf-8');
        if (file_exists("../store/layout_" . $id . ".json")) {
            echo(file_get_contents("../store/layout_" . $id . ".json"));
        } else {
            echo("{\"error\":\"ID does not exist\"}");
        }
    }
?>