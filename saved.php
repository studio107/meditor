<?php
$iterator = new DirectoryIterator('data');
$files = array();
foreach ($iterator as $iter) {
    if(in_array($iter->getFilename(), array('.', '..'))) {
        continue;
    }
    $files[] = $iter->getFilename();
}
ksort($files);
?>
<ul style="list-style-type: none;margin-top:20px;">
    <?php foreach ($files as $file) { ?>
        <li>
            <a href="index.php?template=<?php echo $file; ?>"><?php echo $file ?></a>
            <a href="index.php?show=<?php echo $file; ?>">(show)</a>
        </li>
    <?php } ?>
</ul>