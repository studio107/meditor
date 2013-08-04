<!doctype html>
<!--[if IE 7 ]>		 <html class="no-js ie ie7 lte7 lte8 lte9" lang="en-US"> <![endif]-->
<!--[if IE 8 ]>		 <html class="no-js ie ie8 lte8 lte9" lang="en-US"> <![endif]-->
<!--[if IE 9 ]>		 <html class="no-js ie ie9 lte9>" lang="en-US"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html class="no-js" lang="en-US"> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <title>meditor view</title>

    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,700&subset=latin,cyrillic-ext,cyrillic' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="/static/css/grid.css" />
    <link rel="stylesheet" type="text/css" href="/static/fonts/glyphico/style.css" />
    <link rel="stylesheet" type="text/css" href="/static/css/screen.css" />

    <script type="text/javascript" src="/static/vendor/jquery-1.10.2.js"></script>

    <link rel="stylesheet" href="/static/vendor/leaflet-0.6.4/leaflet.css" />
    <!--[if lte IE 8]>
    <link rel="stylesheet" href="/static/vendor/leaflet-0.6.4/leaflet.ie.css" />
    <![endif]-->
    <script src="/static/vendor/leaflet-0.6.4/leaflet.js"></script>
    <link rel="stylesheet" href="/static/js/plugins/map/map.css" />
    <script type="text/javascript" src="static/js/grid.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
</head>
<body>
    <section id="wrapper">
            <a href="index.php">&larr; Back</a>
            <p class="clear"></p>
            <?php echo file_get_contents(dirname(__FILE__) . DS . 'data' . DS . $_GET['show']); ?>
    </section>
</body>
</html>