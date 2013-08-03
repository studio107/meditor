<?php

define('DS', DIRECTORY_SEPARATOR);

$editor = '';
if (isset($_POST['editor'])){
    $editor = $_POST['editor'];
    file_put_contents(dirname(__FILE__) . DS . 'data' . DS . time() . '.txt', $editor);
}
include 'base.php';