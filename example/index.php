<!doctype html>
<!--[if IE 7 ]>		 <html class="no-js ie ie7 lte7 lte8 lte9" lang="en-US"> <![endif]-->
<!--[if IE 8 ]>		 <html class="no-js ie ie8 lte8 lte9" lang="en-US"> <![endif]-->
<!--[if IE 9 ]>		 <html class="no-js ie ie9 lte9>" lang="en-US"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <title>meditor</title>
    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700&subset=latin,cyrillic-ext,cyrillic' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" type="text/css" href="../dist/css/1.0.0.all.css" />
    <script type="text/javascript" src="../dist/js/1.0.0.all.js"></script>

    <script type="text/javascript" src="../bower_components/ckeditor/ckeditor.js"></script>

    <script type="text/javascript" src="../js/utils.js"></script>
    <script type="text/javascript" src="../js/core.js"></script>
    <script type="text/javascript" src="../js/engine.js"></script>
    <script type="text/javascript" src="../js/editor.js"></script>
    <script type="text/javascript" src="../js/block.js"></script>
    <script type="text/javascript" src="../js/plugins/text/text.js"></script>
    <script type="text/javascript" src="../js/plugins/video.js"></script>
    <script type="text/javascript" src="../js/plugins/lost.js"></script>
    <script type="text/javascript" src="../js/plugins/space.js"></script>
    <script type="text/javascript" src="../js/plugins/image.js"></script>
    <script type="text/javascript" src="../js/plugins/map/map.js"></script>
</head>
<body>

<?php if (isset($_POST['editor'])) {
    $name = isset($_GET['file']) ? $_GET['file'] : time();
    file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . $name, $_POST['editor']);
    ?>
    <h1>File saved!</h1>
    <?php
}else{ ?>

<form action="" method="post">
    <?php
    $value = '';
    if (isset($_GET['file'])){
        $value = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . $_GET['file']);
    } ?>

    <input type="hidden" name="opened" value="<?php echo isset($_GET['file']) ? $_GET['file'] : ''?>"/>
    <textarea name="editor" id="meditor" cols="30" rows="10"><?php echo $value ?></textarea>

    <button class="button" type="submit">Save</button>
</form>

<?php } ?>
<script>
    var editor = meditor.init('#meditor', {
        language: 'ru',
        plugins: ['space', 'text', 'image', 'video']
    });
</script>

<script>
    $(document).foundation();
</script>

</body>
</html>