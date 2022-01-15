<?php
    if (isset($_GET['d'])) {
        $data = $_GET['d'];
        
        $files = scandir('../store');
        $num_files = count($files)-2;
        $id = 0;
        if ($num_files == 50) {
            //Remove earliest id
            unlink('../store/layout_1.json');
            $id = 1;
        } else {
            $id = $num_files + 1;
        }
        
        if (file_put_contents('../store/layout_' . $id . '.json', $data)) {
            echo "OK";
        } else {
            echo "Fout";
        }
    }
?>