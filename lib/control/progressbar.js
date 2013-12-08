
/**
 *
 * Created with NetBeans IDE
 *
 * Code     : ProgressBar JS
 * Version  : 1.0
 *
 * User     : Bugra OZDEN
 * Site     : http://www.bugraozden.com
 * Mail     : bugra.ozden@gmail.com
 *
 * Date     : 9/14/13
 * Time     : 1:10 PM
 *
 */



ProgressBar.OPTION_NAME                     = {};

ProgressBar.OPTION_NAME.ITEM_ID             = "itemID";
ProgressBar.OPTION_NAME.TYPE                = "type";       // bar, line, text
ProgressBar.OPTION_NAME.PERCENT             = "percent";    // 0% - 100%
ProgressBar.OPTION_NAME.COLOR_ID            = "colorID";
ProgressBar.OPTION_NAME.OPACITY             = "opacity";    // 0.0 - 1.0
ProgressBar.OPTION_NAME.ALIGN               = "align";      // left, right
ProgressBar.OPTION_NAME.SPACE               = "space";      // 0% - 100%
ProgressBar.OPTION_NAME.POSITION            = "position";   // absolute, relative

ProgressBar.OPTION_VALUE                    = {};
ProgressBar.OPTION_VALUE.COLOR_ID           = {};
ProgressBar.OPTION_VALUE.COLOR_ID.BLUE      = "blue";
ProgressBar.OPTION_VALUE.COLOR_ID.GREEN     = "green";
ProgressBar.OPTION_VALUE.COLOR_ID.YELLOW    = "yellow";
ProgressBar.OPTION_VALUE.COLOR_ID.ORANGE    = "orange";
ProgressBar.OPTION_VALUE.COLOR_ID.RED       = "red";
ProgressBar.OPTION_VALUE.COLOR_ID.WHITE     = "white";
ProgressBar.OPTION_VALUE.COLOR_ID.BLACK     = "black";

ProgressBar.OPTION_VALUE.TYPE               = {};
ProgressBar.OPTION_VALUE.TYPE.BAR           = "bar";
ProgressBar.OPTION_VALUE.TYPE.LINE          = "line";
ProgressBar.OPTION_VALUE.TYPE.TEXT          = "text";

ProgressBar.OPTION_VALUE.ALIGN              = {};
ProgressBar.OPTION_VALUE.ALIGN.LEFT         = "left";
ProgressBar.OPTION_VALUE.ALIGN.RIGHT        = "right";

ProgressBar.OPTION_VALUE.POSITION           = {};
ProgressBar.OPTION_VALUE.POSITION.ABSOLUTE  = "absolute";
ProgressBar.OPTION_VALUE.POSITION.RELATIVE  = "relative";

ProgressBar.DEFAULT_VALUE                   = {};
ProgressBar.DEFAULT_VALUE.WIDTH             = "100px";
ProgressBar.DEFAULT_VALUE.HEIGHT            = "6px";

ProgressBar.DEFAULT_VALUE.TYPE              = ProgressBar.OPTION_VALUE.TYPE.BAR;
ProgressBar.DEFAULT_VALUE.PERCENT           = 0;
ProgressBar.DEFAULT_VALUE.COLOR_ID          = ProgressBar.OPTION_VALUE.COLOR_ID.BLUE;
ProgressBar.DEFAULT_VALUE.OPACITY           = 1;
ProgressBar.DEFAULT_VALUE.ALIGN             = "left";
ProgressBar.DEFAULT_VALUE.SPACE             = 0;
ProgressBar.DEFAULT_VALUE.POSITION          = "relative";

ProgressBar.DEFAULT_VALUE.LINE_COLOR_ID     = ProgressBar.OPTION_VALUE.COLOR_ID.RED;
ProgressBar.DEFAULT_VALUE.LINE_OPACITY      = 0.5;

ProgressBar.EVENT                           = {};
ProgressBar.EVENT.STARTING                  = "starting";
ProgressBar.EVENT.CHANGED                   = "changed";
ProgressBar.EVENT.COMPLETED                 = "completed";

ProgressBar.getVersion = function(){ return "1.2" };

function ProgressBar($elementID, $options)
{
	
    var _optionName = ProgressBar.OPTION_NAME;
    var _optionValue = ProgressBar.OPTION_VALUE;
    var _defaultValue  = ProgressBar.DEFAULT_VALUE;
    var _event  = ProgressBar.EVENT;
    
    var _elementID = $elementID;
    var _element = document.getElementById(_elementID);

    var _items = [];
    var _itemElements = [];
    var _width = "";
    var _height = "";

    //Hızlı bulma
    var _exItemID = "";
    var _exItemIndex = "";

    //Value kullanma
    var _maxValue = 100;
    var _centesimal = 1;
    var _exValues = {};
    
    var _that = this;
	
	var _init = function(){
		
	    $options = $options || {};

	    if($elementID){

	        _that.setWidth($options.width || _defaultValue.WIDTH);
	        _that.setHeight($options.height || _defaultValue.HEIGHT);

	        _element.innerHTML = "";
	        _element.setAttribute('class', 'progressbar-control');

	    }
		
	}

    var _initialModeEngine = function(){

        if(_items.length == 1){

            var me = _initialModeEngine;

            var itemIndex = 0;
            var item = _items[itemIndex];

            var currentAlign = _that.getOptionValue(_optionName.SPACE);

            var nextAlign = ( currentAlign == 0) 
                ? 100 -  _that.getOptionValue(_optionName.PERCENT)
                : 0;

            _that.setOptionValue(_optionName.SPACE, nextAlign, item[_optionName.ITEM_ID]); 

            _initialModeTimer = setTimeout(function(){
                me();
            }, 700);

        }

    };

    //itemID sinden, items (array) içinde hangi sırada olduğunu bul.
    var _getItemIndexByID = function($itemID){

        // Hızlı bulma
        if ($itemID && $itemID == _exItemID) {
            return _exItemIndex;
        }

        var itemIndex = 0;

        //length 1 ise [0]
        if(_items.length != 1){

            //length 0 ise yeni oluştur
            if(_items.length == 0){

                //var itemID = $itemID || "";
                _that.createItem({'itemID':$itemID});

            //length > 1 ise bul
            }else if(_items.length > 1){

                //itemID boş ise [0]
                if (!$itemID) return 0;

                //hepsine bak
                for(var i = 0, j = _items.length; i < j; i++ ){

                    if(_items[i][_optionName.ITEM_ID] == $itemID ){

                        //Bulunan nesnenin bilgilerini sakla.
                        _exItemID = $itemID;
                        _exItemIndex = i;

                        return i;

                    }

                }

            }

        }

        return itemIndex;

    };

    // Set edilen boyut için yeterli alan var mı?
    var _calculateAvailablePercent = function($percent ,$itemIndex){

        if($percent < 0) return 0;

        var item = _items[$itemIndex];

        var totalUsedPercent = 0;
        var availablePercent = 0;

        switch(item[_optionName.POSITION]){

            case _optionValue.POSITION.RELATIVE:

                for(var i = 0, j = _items.length; i < j; i++ ){

                    if(i != $itemIndex &&
                        _items[i][_optionName.POSITION] == _optionValue.POSITION.RELATIVE){

                        totalUsedPercent += _items[i][_optionName.PERCENT];

                    }

                }

                availablePercent = 100 - totalUsedPercent;

                //POSITION: RELATIVE olan nesneler arasında yer kalmaz ise COMPLETED yap.
                if(($percent >= availablePercent)) {

                    //var me = _that;

                    setTimeout(function(){

                        _element.dispatchEvent(new CustomEvent(_event.COMPLETED, {'detail':{'itemID':item.itemID, 'me':_that}} ));

                    }, 500);

                }


                break;

            case _optionValue.POSITION.ABSOLUTE:

                availablePercent = 100 - item[_optionName.SPACE];

                break;

        }

        return ($percent <= availablePercent) ? $percent : availablePercent;

    };
        
    this.getElement = function() { return _element; };
   
    this.getWidth = function(){ return _width; };
    this.setWidth = function($width){

        _width = _element.style.width = $width;
        return true;

    };

    this.getHeight = function(){ return _height; };
    this.setHeight = function($height){

        _height = _element.style.height = $height;
        return true;

    };

    this.createItem = function($item){

        if(typeof $item == "string") {

            var itemID = $item;

            $item = {};
            $item[_optionName.ITEM_ID] = itemID;

        }

        /*

         <div id="my-progressbar" class="progressbar-control">
            <div class="item-bar"></div>
            <div class="item-bar"></div>
            <div class="item-line"></div>
         </div>

         */

        $item = $item || {};

        //Yeni nesne için element oluştur
        var itemElement = _element.appendChild(document.createElement('div'));

        var itemID = $item[_optionName.ITEM_ID] = $item[_optionName.ITEM_ID] || "";

        //Daha önce eklenmiş nesne var ise ID siz nesne ekleyemez.
        if(_items.length > 0 && itemID == "") return false;

        // DEFAULT değerleri set et.
        $item[_optionName.TYPE]     = $item[_optionName.TYPE] || _defaultValue.TYPE;    
        $item[_optionName.PERCENT]  = $item[_optionName.PERCENT]    || _defaultValue.PERCENT;
        $item[_optionName.ALIGN]    = $item[_optionName.ALIGN]      || _defaultValue.ALIGN;

        //SPACE varsa POSITION: ABSOLUTE olmalı
        if($item[_optionName.SPACE]){

            $item[_optionName.POSITION] = _optionValue.POSITION.ABSOLUTE;

        }else{

            $item[_optionName.SPACE] = _defaultValue.SPACE;
            // (OK)ERROR: SPACE değeri olmayan bir ABSOLUTE item oluşturulamıyorudu.
            $item[_optionName.POSITION] = $item[_optionName.POSITION] || _optionValue.POSITION.RELATIVE;

        }

        //TYPE a göre değişen DEFAULT değerler
        switch($item[_optionName.TYPE]){

            case _optionValue.TYPE.BAR:

                $item[_optionName.COLOR_ID] = $item[_optionName.COLOR_ID]   || _defaultValue.COLOR_ID;
                $item[_optionName.OPACITY]  = $item[_optionName.OPACITY]    || _defaultValue.OPACITY;

                break;

            case _optionValue.TYPE.LINE:

                $item[_optionName.COLOR_ID] = $item[_optionName.COLOR_ID]   || _defaultValue.LINE_COLOR_ID;
                $item[_optionName.OPACITY]  = $item[_optionName.OPACITY]    || _defaultValue.LINE_OPACITY;
                $item[_optionName.POSITION] = _optionValue.POSITION.ABSOLUTE;
                $item[_optionName.SPACE] = $item[_optionName.PERCENT];

                break;

        }

        // Nesneyi listeye ekle
        _items.push($item);
        _itemElements.push(itemElement);

        //nesneyi oluşturulurken gizle
        itemElement.style.opacity = 0;

        itemElement.classList.add('item-' + $item[_optionName.TYPE]);

        this.setOptionValue(_optionName.COLOR_ID, $item[_optionName.COLOR_ID], itemID);

        this.setOptionValue(_optionName.ALIGN, $item[_optionName.ALIGN], itemID);
        // ALIGN değeri set edildiğinde SPACE değeri otomatik güncellenir.
        //if($item[_optionName.SPACE]) this.setOptionValue(_optionName.SPACE, $item[_optionName.SPACE], itemID);
        this.setOptionValue(_optionName.POSITION, $item[_optionName.POSITION], itemID);
        // PERCENT değeri set edildiğinde opacity değeri otomatik güncellenir.
        //this.setOptionValue(_optionName.OPACITY, $item[_optionName.OPACITY], itemID);
        this.setOptionValue(_optionName.PERCENT, $item[_optionName.PERCENT], itemID);

        return true;

    };

    this.removeItem = function($itemID){

        var itemIndex = _getItemIndexByID($itemID);
        var itemElement = _itemElements[itemIndex];

        if(itemElement != null ){

            itemElement.parentNode.removeChild(itemElement);
            _items.splice(itemIndex  ,1);
            _itemElements.splice(itemIndex  ,1);

            return true;

        }

        return false;

    };

    this.removeAll = function(){

        if(_element){

            _element.innerHTML = "";
            _items = [];
            _itemElements = [];

            return true;

        }

        return false;

    };

    this.getMaxValue = function() { return _maxValue; };
    this.setMaxValue = function($maxValue){

            if(_maxValue != $maxValue && $maxValue) {

                _centesimal = 100 / $maxValue;
                _maxValue = $maxValue;

            }

        return _centesimal;

    };

    this.getExValue = function($itemID) { 

        $itemID = $itemID || "first";

        var result = _exValues[$itemID] || 0;

        return result;

    };
    this.getPercentByValue = function($value, $itemID, $maxValue){

        //Yeni maxValue gelmişse set et.
        if($maxValue && $maxValue != this.getMaxValue()) this.setMaxValue($maxValue);

        //value değeri 0 - maxValue arasında olabilir.
        if($value < 0) $value = 0;
        if($value > this.getMaxValue()) $value = this.getMaxValue();

        //itemID boş ise first olarak adlandır.
        $itemID = $itemID || "first";

        _exValues[$itemID] = $value;
        var result = ($maxValue) ? $value * this.getMaxValue($maxValue) : $value * _centesimal;

        return parseInt(result);

    };

    this.getOptionValue = function($optionName, $itemID){

        var itemIndex = _getItemIndexByID($itemID);

        return _items[itemIndex][$optionName];

    };

    this.setOptionValue = function($optionName, $value, $itemID){

        var itemIndex = _getItemIndexByID($itemID);

        var itemElement = _itemElements[itemIndex];
        var item = _items[itemIndex];

        switch ($optionName) {

            case _optionName.ITEM_ID:

                //unchangeable option
                return false;

                break;

            case _optionName.TYPE:

                //unchangeable option
                return false;

                break;

            case _optionName.PERCENT:

                var me = this;

                setTimeout(function(){

                //Sadece tam değer al.
                $value = parseInt($value) || 0;

                switch(item[_optionName.TYPE]) {

                    case _optionValue.TYPE.BAR:

                            $value = _calculateAvailablePercent($value, itemIndex);
                            itemElement.style.width = $value + '%';
                            item[_optionName.PERCENT] = $value;

                        break;

                    case _optionValue.TYPE.LINE:

                            //SPACE değeri değiştiğinde LINE nesnesi için PERCENT değeride otomatik değişir.
                            //item[_optionName.PERCENT] = $value;
                            me.setOptionValue(_optionName.SPACE, $value, $itemID);

                            //Görünürlüğü ayarla
                            //itemElement.style.opacity = item[_optionName.OPACITY];

                        break;

                }

                // Bar yüzdesi 0 ise geçici olarak görünmez yap
                var isShown = ($value == 0 ) ? 0 : item[_optionName.OPACITY];
                itemElement.style.opacity = isShown;

                setTimeout(function(){

                    _element.dispatchEvent(new CustomEvent(_event.CHANGED, {'detail':{'itemID':$itemID, 'me':me}} ));

                    switch($value){

                        case 0:

                            _element.dispatchEvent(new CustomEvent(_event.STARTING, {'detail':{'itemID':$itemID, 'me':me}} ));
                            break;

                        case 100:

                            _element.dispatchEvent(new CustomEvent(_event.COMPLETED, {'detail':{'itemID':$itemID, 'me':me}} ));
                            break;

                        default:

                            break;

                    }

                }, 240);

                }, 10);

                break;

            case _optionName.COLOR_ID:

                itemElement.classList.remove(item[_optionName.COLOR_ID]);
                itemElement.classList.add($value);
                item[_optionName.COLOR_ID] = $value;

                break;

            case _optionName.OPACITY:

                //Sadece PERCENT > 0 ise uygula
                if(item[_optionName.PERCENT]) itemElement.style.opacity = $value;
                item[_optionName.OPACITY] = $value;

                break;

            case _optionName.ALIGN:

                //ALIGN değeri değiştiğinde POSITION, RELATIVE olmalı
                //this.setOptionValue(_optionName.POSITION, _optionValue.POSITION.RELATIVE, $itemID);

                itemElement.style.cssFloat = $value;
                item[_optionName.ALIGN] = $value;

                //ALIGN değeri değişir ise SPACE değerini güncelle
                if(item[_optionName.POSITION] == _optionValue.POSITION.ABSOLUTE)
                    //if(item[_optionName.SPACE])
                            this.setOptionValue(_optionName.SPACE, item[_optionName.SPACE], $itemID);

                break;

            case _optionName.SPACE:

                //LINE nesnesi için SPACE değeri PERCENT değeridir.
                if(item[_optionName.TYPE] == _optionValue.TYPE.LINE){

                    // Değer 0 ile 100 arasında olmalı
                    if($value < 0) $value = 0;
                    if($value > 100) $value = 100;

                    item[_optionName.PERCENT] = $value;

                }

                //SPACE değeri verilirse position u absolute yap.
                if(item[_optionName.POSITION] != _optionValue.POSITION.ABSOLUTE)
                    this.setOptionValue(_optionName.POSITION, _optionValue.POSITION.ABSOLUTE, $itemID);

                //Önceki değeri sıfırla
                itemElement.style.left = "";
                itemElement.style.right = "";

                itemElement.style[item[_optionName.ALIGN]] = $value + '%';
                item[_optionName.SPACE] = $value;

                // TODO: BAR ise PERCENT değerini tekrar güncelle, değişiklik olabilir.
                if(item[_optionName.TYPE] == _optionValue.TYPE.BAR)
                    this.setOptionValue(_optionName.PERCENT, item[_optionName.PERCENT], $itemID);

                break;

            case _optionName.POSITION:

                switch(item[_optionName.TYPE]) {

                    case _optionValue.TYPE.BAR:

                            //POSITION, RELATIVE ise SPACE değerini sil.
                            if($value == _optionValue.POSITION.RELATIVE){
                                itemElement.style.left = "";
                                itemElement.style.right = "";

                                //SPACE değerini array içine yaz.
                                item[_optionName.SPACE] = 0;
                            }

                            itemElement.style.position = $value;
                            item[_optionName.POSITION] = $value;

                        break;

                    case _optionValue.TYPE.LINE:

                            //LINE nesnesi için POSITION değeri düzenlenemez.
                            $value = _optionValue.POSITION.ABSOLUTE;
                            itemElement.style.position = $value;
                            item[_optionName.POSITION] = $value;

                        break;

                }

                break;

        }

        return true;

    };

    this.getPercent = function($itemID){

        return this.getOptionValue(_optionName.PERCENT, $itemID);

    };

    this.setPercent = function($value, $itemID){

        return this.setOptionValue(_optionName.PERCENT, $value, $itemID);

    };

    this.initialMode = function(isInitialMode){

        if(isInitialMode){

            this.removeAll();
            this.setPercent(25);

            //this.setOptionValue(_optionName.OPACITY, 0.7);
            this.setOptionValue(_optionName.COLOR_ID, _optionValue.COLOR_ID.WHITE);

            var me = this;

            //Engine çalışmadan önce PERCENT set edilebilsin.
            setTimeout(function(){
                _initialModeEngine();
            }, 50);

        }else{

            clearTimeout(_initialModeTimer);
            this.removeAll();

        }



    };

	_init();
 
}