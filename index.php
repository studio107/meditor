<?php

define('DS', DIRECTORY_SEPARATOR);

$editor = '';
if (isset($_POST['editor'])) {
    $editor = $_POST['editor'];
    $name = time() . '.txt';
    file_put_contents(dirname(__FILE__) . DS . 'data' . DS . $name, $editor);
    header('Location: index.php?show=' . $name);
}
if (isset($_GET['show']))
    include 'view.php';
else
    include 'base.php';
