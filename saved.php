<ul style="list-style-type: none;margin-top:20px;">
    <?php
    $iterator = new DirectoryIterator('data');
    foreach ($iterator as $iter) {
        if(in_array($iter->getFilename(), array('.', '..'))) {
            continue;
        }
        ?>
        <li>
            <a href="index.php?template=<?php echo $iter->getFilename(); ?>"><?php echo $iter->getFilename() ?></a>
            <a href="index.php?show=<?php echo $iter->getFilename(); ?>">(show)</a>
        </li>
    <?php } ?>
</ul>