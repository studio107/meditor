$(function(){
    var register_desktop = {};
    var register_pad = {};
    var current_statement = 'desktop'; // or pad
    var getCol = function($block) {
        var classes = $block[0].classList;

        var cn = '';
        var colClass = 'col-';

        var i = 0;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return parseInt(cn.substr(colClass.length))
            }
        }
        return 0;
    };

    var removeCls = function($block) {
        var classes = $block[0].classList;

        var cn = '';
        var colClass = 'col-';

        var i;
        for (i = 0; i < classes.length; i++) {
            cn = classes[i];
            if (cn.indexOf(colClass) == 0) {
                return $block.removeClass(cn);
            }
        }
    };

    function resize(register){
        $('.row').each(function (t, row) {
            var sum = 0;
            var $items = $(row).find('[class*="col-"]');
            for(var i = 0; i < $items.length; i++) {
                var $block = $($items[i]);
                $block.removeClass('first');
                //sum += register[t][i];

                if (sum <= 0){
                    $block.addClass('first');
                    sum = 12;
                }
                removeCls($block);
                $block.addClass('col-' + register[t][i]);
                sum -= register[t][i];
            }
        });
    }

    $('.row').each(function (t, row) {
        register_desktop[t] = {};
        register_pad[t] = {};

        var $items = $(row).find('[class*="col-"]');
        var summ = 0;
        var csumm = 0;
        var sum_after_middle = 0;
        var half = false;
        var middleitem = undefined;
        var tail = undefined;
        var append = undefined;

        for(var i = 0; i < $items.length; i++) {
            var $col = $($items[i]);
            register_desktop[t][i] = getCol($col);

            // Достигли экватора
            if ((summ + getCol($col) >= 6) && (summ < 6)){
                if ((summ + getCol($col)) == 6)
                    half = true;
                middleitem = i;

                csumm = summ;
                if (half)
                    csumm = summ + getCol($col);

                sum_after_middle = 12 - (summ + getCol($col));

                var to = (half) ? i : i - 1;

                if (to > 0){
                    csumm = 12 - (csumm * 2);
                    tail = csumm % (to + 1);
                    append = Math.floor(csumm / (to + 1));
                    for (var j = 0; j <= to; j++){
                        register_pad[t][j] = register_desktop[t][j] * 2 + append;
                        if (j == to)
                            register_pad[t][j] = register_desktop[t][j] * 2 + append + tail;
                    }
                }else if(to == 0){
                    register_pad[t][to] = 12;
                }
                if (!half)
                    register_pad[t][i] = 12;
            }

            summ += getCol($col);
        }

        var count = ($items.length) - (middleitem + 1);

        if (count){
            csumm = 12 - (sum_after_middle * 2);
            tail = csumm % (count);
            append = Math.floor(csumm / (count));

            for(j = middleitem + 1; j < $items.length; j++) {
                register_pad[t][j] = register_desktop[t][j] * 2 + append;
                if (j == $items.length - 1)
                    register_pad[t][j] = register_desktop[t][j] * 2 + append + tail;
            }
        }
    });

    handle_resize = function(event){
        var width = $(window).width();
        if (width < 978){
            if (current_statement != 'pad'){
                current_statement = 'pad';
                resize(register_pad);
            }
        }else{
            if (current_statement != 'desktop'){
                current_statement = 'desktop';
                resize(register_desktop);
            }
        }
    };

    $(window).on('resize',handle_resize);
    $(window).on('orientationchange',handle_resize);
    handle_resize();
});