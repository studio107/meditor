<!doctype html>
<!--[if IE 7 ]>		 <html class="no-js ie ie7 lte7 lte8 lte9" lang="en-US"> <![endif]-->
<!--[if IE 8 ]>		 <html class="no-js ie ie8 lte8 lte9" lang="en-US"> <![endif]-->
<!--[if IE 9 ]>		 <html class="no-js ie ie9 lte9>" lang="en-US"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <title>meditor</title>

    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700&subset=latin,cyrillic-ext,cyrillic' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="/static/css/screen.css" />
    <link rel="stylesheet" type="text/css" href="/static/css/editor.css" />
    <link rel="stylesheet" type="text/css" href="/static/fonts/glyphico/style.css" />

    <script type="text/javascript" src="/static/vendor/jquery-1.10.2.js"></script>
    <script type="text/javascript" src="/static/vendor/underscore.js"></script>

    <script type="text/javascript" src="/static/vendor/mindy/jquery.mdropdown.js"></script>

    <script type="text/javascript" src="/static/js/utils.js"></script>
    <script type="text/javascript" src="/static/js/core.js"></script>
    <script type="text/javascript" src="/static/js/engine.js"></script>
    <script type="text/javascript" src="/static/js/editor.js"></script>
    <script type="text/javascript" src="/static/js/block.js"></script>

    <script type="text/javascript" src="/static/js/plugins/text/text.js"></script>
    <script type="text/javascript" src="/static/js/plugins/lost.js"></script>
    <script type="text/javascript" src="/static/js/plugins/space.js"></script>

    <link rel="stylesheet" href="/static/vendor/leaflet-0.6.4/leaflet.css" />
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="/static/vendor/leaflet-0.6.4/leaflet.ie.css" />
    <![endif]-->
    <script src="/static/vendor/leaflet-0.6.4/leaflet.js"></script>
    <link rel="stylesheet" href="/static/js/plugins/map/map.css" />
    <script type="text/javascript" src="/static/js/plugins/map/map.js"></script>
</head>
<body>
    <section id="wrapper">
        <?php if(isset($_GET['show'])) { ?>

            <a href="index.php">&larr; Back</a>
            <p class="clear"></p>
            <?php echo file_get_contents(dirname(__FILE__) . DS . 'data' . DS . $_GET['show']); ?>
        <?php } else { ?>
            <form method="POST">
                <textarea name="editor" id="meditor" cols="30" rows="10"><?php
                    if(isset($_GET['template'])) {
                        $editor = file_get_contents(dirname(__FILE__) . DS . 'data' . DS . $_GET['template']);
                    }

                    echo $editor;
                ?></textarea>
                <button class="button">
                    Сохранить
                </button>
            </form>
            <script type="text/javascript">
                var editor = meditor.init('#meditor', {
                    language: 'ru',
                    plugins: ['space', 'text', 'map']
                });
            </script>
        <?php } ?>

        <?php
        if(isset($_GET['show']) == false) {
            include "saved.php";
        }
        ?>
    </section>
</body>
</html>