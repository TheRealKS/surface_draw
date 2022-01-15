<?php
    $files = scandir("../store"); // get all file names
    $i = 0;
    foreach($files as $file) { // iterate files
      if(is_file("../store/" . $file)) {
        unlink("../store/" . $file); // delete file
        $i++;
      }
    }
    echo("Deleted " . $i . " files");
?>