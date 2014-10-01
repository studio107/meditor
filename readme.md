### Mindy field example

```php
<?php
/**
 *
 *
 * All rights reserved.
 *
 * @author Falaleev Maxim
 * @email max@studio107.ru
 * @version 1.0
 * @company Studio107
 * @site http://studio107.ru
 * @date 15/05/14.05.2014 18:11
 */

namespace Mindy\Form\Fields;

use Mindy\Helper\JavaScript;

class WysiwygField extends TextAreaField
{
    public function render()
    {
        $model = $this->form->getInstance();
        $options = Javascript::encode([
            'language' => 'ru',
            'plugins' => ['space', 'text', 'image', 'video'],
            'image' => [
                'uploadUrl' => '/core/files/upload/?path=' . $model->getModuleName() . '/' . $model->classNameShort()
            ]
        ]);
        $js = "<script type='text/javascript'>var editor = meditor.init('#{$this->getId()}', $options);</script>";
        return htmlentities($this->getValue()) . parent::render() . $js;
    }
}
```
