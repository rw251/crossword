// From http://stackoverflow.com/a/2897510/596639
// Thanks to http://stackoverflow.com/users/243443/markb29
// and http://stackoverflow.com/users/43677/bezmax
(function($) {
    $.fn.getCursorPosition = function() {
        var input = this.get(0);
        if (!input) return; // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        }
        else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    };
    $.fn.selectRange = function(start, end) {
        if (end === undefined) {
            end = start;
        }
        return this.each(function() {
            if ('selectionStart' in this) {
                this.selectionStart = start;
                this.selectionEnd = end;
            }
            else if (this.setSelectionRange) {
                this.setSelectionRange(start, end);
            }
            else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
    $.fn.setCursorPosition = function(pos) {
        this.selectRange(pos);
    };
    $.fn.mask = function(mask) {
        var isAndroid = /(android)/i.test(navigator.userAgent),
            isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
            inputEl = this,
            prevVal = mask,
            cp, val;

        inputEl.on('mousedown', function(){
           if(!inputEl.is(':focus')){
               inputEl.data('notin','true');
           } 
        });
        inputEl.on('click', function() {
            if(inputEl.data('notin')==='true') {
                inputEl.data('notin','false');
                cp=0;
            } else {
                cp = inputEl.getCursorPosition();
                val = inputEl.val();
    
                if (cp >= val.length) {
                    cp = val.length - 1;
                }
                else if (cp % 2 != 0) {
                    cp++;
                }
    
                while (val[cp].search(/[a-zA-Z_]/) === -1) {
                    cp += 2;
                }
            }

            inputEl.setCursorPosition(cp);
        });

        if (!isAndroid) {
            inputEl.val(prevVal);

            inputEl.on('input', function(e){
                //workaround if backspace is pressed on android default browser
                if (inputEl.val().length + 1 === prevVal.length) {
                    //backspace pressed
                    cp = inputEl.getCursorPosition();
                    val = inputEl.val();
                    
                    if (cp === inputEl.val().length) {
                        val = prevVal.substr(0, prevVal.length - 1) + '_';
                    }
                    else {
                        val = prevVal.substr(0, nextCell(inputEl, false, cp - 1)) + '_' + prevVal.substr(nextCell(inputEl, false, cp - 1) + 1);
                        cp = nextCell(inputEl, false, cp - 1);
                    }
                    inputEl.val(val);
                    inputEl.setCursorPosition(cp);
                    prevVal = val;
                } 
            });

            inputEl.on('keypress', function(e) {
                cp = inputEl.getCursorPosition();
                val = inputEl.val();
                var goright = false;
                //e.which = currentKey;

                if (e.which === 8) {
                    if (cp === 0) return;
                    cp = nextCell(inputEl, false, cp - 1);
                    val = val.substr(0, cp) + '_' + val.substr(cp + 1);
                }

                //if cursor left
                else if (e.which === 37) {
                    cp--;
                }
                else if (cp === val.length) {

                }
                //if a-z
                else if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122)) {
                    val = val.substr(0, cp) + String.fromCharCode(e.which) + val.substr(cp + 1);
                    val = val.toUpperCase();
                    goright = true;
                    cp++;
                }
                //if space
                else if (e.which === 32) {
                    val = prevVal;
                    goright = true;
                    cp++;
                }

                //if cursor right
                else if (e.which === 39) {
                    goright = true;
                    cp++;
                }

                //else
                else {
                    val = prevVal;
                    cp--;
                }

                inputEl.val(val);
                cp = nextCell(inputEl, goright, cp);
                inputEl.setCursorPosition(cp);
                prevVal = val;
                
                e.preventDefault();
            });
        }
        else {
            //android
            inputEl.val(prevVal);
            
            inputEl.on('keyup', function(e) {
                cp = inputEl.getCursorPosition();
                val = inputEl.val();
                var goright = false;
                e.which = (e.which === 229 || e.which === 0) ? val[cp - 1].toUpperCase().charCodeAt(0) : e.which;

                if (e.which === 8) {
                    val = prevVal;
                    if (cp === inputEl.val().length) {
                        val = val.substr(0, val.length - 1) + '_';
                    }
                    else if (cp !== 0) {
                        cp = nextCell(inputEl, false, cp - 1);
                        val = val.substr(0, cp) + '_' + val.substr(cp + 1);
                    }
                }

                //if cursor left
                else if (e.which === 37) {

                }
                else if (cp === val.length) {
                    val = prevVal;
                }
                //if a-z
                else if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122)) {
                    val = val.substr(0, cp) + val.substr(cp + 1);
                    val = val.toUpperCase();
                    goright = true;
                }
                //if space
                else if (e.which === 32) {
                    val = prevVal;
                    goright = true;
                }
                //if cursor right
                else if (e.which === 39) {
                    goright = true;
                }
                //else
                else {
                    val = prevVal;
                }

                inputEl.val(val);
                cp = nextCell(inputEl, goright, cp);
                inputEl.setCursorPosition(cp);
                prevVal = val;
            });
        }

        if (isAndroid && !isChrome) {
            inputEl.on('input', function(e) {
                //workaround if backspace is pressed on android default browser
                if (inputEl.val().length + 1 === prevVal.length) {
                    //backspace pressed
                    cp = inputEl.getCursorPosition();
                    val = inputEl.val();
                    
                    if (cp === inputEl.val().length) {
                        val = prevVal.substr(0, prevVal.length - 1) + '_';
                    }
                    else {
                        val = prevVal.substr(0, nextCell(inputEl, false, cp - 1)) + '_' + prevVal.substr(nextCell(inputEl, false, cp - 1) + 1);
                        cp = nextCell(inputEl, false, cp - 1);
                    }
                    inputEl.val(val);
                    inputEl.setCursorPosition(cp);
                    prevVal = val;
                }
            });
        }
    };
})(jQuery);

function nextCell(elem, isRight, currentPos) {
    var val = elem.val();
    while (currentPos > 0 && currentPos < val.length - 1 && val[currentPos].search(/[a-zA-Z_]/) === -1) {
        currentPos = isRight ? currentPos + 1 : currentPos - 1;
    }
    return currentPos;
};


$(document).ready(function() {

    $('#word2').mask('_ _ _ _ / _ _ _ _ _');
});
