// From http://stackoverflow.com/a/2897510/596639
// Thanks to http://stackoverflow.com/users/243443/markb29
// and http://stackoverflow.com/users/43677/bezmax
(function($) {
    function nextCell(elem, isRight, currentPos) {
        var val = elem.val();
        while (currentPos > 0 && currentPos < val.length - 1 && val[currentPos].search(/[a-zA-Z_]/) === -1) {
            currentPos = isRight ? currentPos + 1 : currentPos - 1;
        }
        return currentPos;
    };
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
            
        inputEl.data("masked","true");
        
        inputEl.off('focus');
        inputEl.on('focus', function(){
            inputEl.setCursorPosition(0);
        });
            
        inputEl.off('mousedown');
        inputEl.on('mousedown', function() {
            if (!inputEl.is(':focus')) {
                inputEl.data('notin', 'true');
            }
        });
        inputEl.off('click');
        inputEl.on('click', function() {
            if (inputEl.data('notin') === 'true') {
                inputEl.data('notin', 'false');
                cp = 0;
            }
            else {
                cp = inputEl.getCursorPosition();
                val = inputEl.val();

                if (cp >= val.length) {
                    cp = val.length;
                }
                else if (cp % 2 != 0) {
                    cp++;

                    while (cp < val.length && val[cp].search(/[a-zA-Z_]/) === -1) {
                        cp += 2;
                    }
                }
            }

            inputEl.setCursorPosition(cp);
        });

        if (!isAndroid) {
            inputEl.val(prevVal);

            inputEl.off('input');
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
            
            inputEl.off('keyup');
            inputEl.on('keyup', function(e){
                cp = inputEl.getCursorPosition();
                var goright = false;
                
                //if cursor left
                if (e.which === 37) {
                    cp--;
                }
                
                else if (e.which === 39) {
                    goright = true;
                    cp++;
                }
                
                cp = nextCell(inputEl, goright, cp);
                inputEl.setCursorPosition(cp);

                e.preventDefault();
            });

            inputEl.off('keypress');
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

            inputEl.off('keyup');
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
            inputEl.off('input');
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

var CWORD = function() {

    var cword = [];
    var keys = [];
    var clueId = 0;
    var clue;
    var elCl, elWord;

    function joinMask(mask) {
        var parts = [],
            i = 0;
        for (i = 0; i < mask.length; i++) {
            if (mask[i] === '_') parts.push(i);
        }
        var totalLen = 0;
        for (i = 0; i < clue.others.length; i++) {
            totalLen += cword[clue.others[i]].positions.length;
        }
        var k = 0;
        for (i = 0; i < clue.others.length; i++) {
            for (var j = 0; j < cword[clue.others[i]].positions.length; j++) {
                if (cword[clue.others[i]].positions[j].myans) {
                    mask = mask.substr(0, parts[k]) + cword[clue.others[i]].positions[j].myans + mask.substr(parts[k] + 1);
                }
                k++;
            }
        }
        return mask;
    }

    function getMask2(l) {
        var els = l.split('-');
        var a = [];
        for (var i = 0; i < els.length; i++) {
            a.push(Array(parseInt(els[i]) + 1).join("_ "));
        }
        return a.join("- ");
    }

    function getMask() {
        var l = clue.length;
        var els = l.split(",");
        var a = [];
        for (var i = 0; i < els.length; i++) {
            a.push(getMask2(els[i]));
        }
        return joinMask(a.join("/ ")).trim();
    }

    function setMask() {
        elWord.val("").mask(getMask());
        if ($(window).width() >= 1024) {
            elWord.focus();
        }
    }

    function printClue() {
        return keys[clueId] + ": " + clue.clue + " (" + clue.length + ")";
    }

    function saveClue() {
        var wd = elWord.val().replace(/[ \-\/_]/g, ""),
            i;
        var totalLen = 0;
        for (i = 0; i < clue.others.length; i++) {
            totalLen += cword[clue.others[i]].positions.length;
        }
        if (wd.length === totalLen) {
            var k = 0;
            for (i = 0; i < clue.others.length; i++) {
                for (var j = 0; j < cword[clue.others[i]].positions.length; j++) {
                    var p = cword[clue.others[i]].positions[j];
                    p.myans = wd[k];
                    if (p.intersection) {
                        cword[p.intersection.location].positions[p.intersection.position - 1].myans = wd[k];
                    }
                    k++;
                }
            }
            if (supports_html5_storage()) {
                local("c", {
                    clues: cword,
                    no: parseInt($('#number').text(), 10)
                });
            }
        }
    }


    function nextClue(forward) {
        clueId = forward ? (clueId + 1) % keys.length : (clueId + keys.length - 1) % keys.length;
        clue = cword[keys[clueId]];
        while (clue.clue.indexOf("</span>") > -1 || clue.length.indexOf("See") > -1) {
            clueId = forward ? (clueId + 1) % keys.length : (clueId + keys.length - 1) % keys.length;
            clue = cword[keys[clueId]];
        }
        elCl.html(printClue());
        setMask();
    }

    function supports_html5_storage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        }
        catch (e) {
            return false;
        }
    }

    function local(key, obj) {
        if (!obj) {
            return JSON.parse(localStorage.getItem(key));
        }
        else {
            localStorage.setItem(key, JSON.stringify(obj));
        }
    }

    var obj = {
        nxt: function(forward) {
            saveClue();
            nextClue(forward);
        },
        loadCrossword: function(id) {
            id = id ? id : Math.floor(26000 + 100 * Math.random());
            window.location = '?' + id;
        },
        load: function(c, clueElement, wordElement) {
            elCl = clueElement;
            elWord = wordElement;
            var r = Math.random();
            $.getJSON(c + "?v=" + r, function(data) {
                cword = data.clues;
                if (supports_html5_storage()) {
                    var lcal = local("c");
                    if (lcal && lcal.no === data.no) {
                        cword = lcal.clues;
                    }
                    else {
                        local("c", {
                            clues: data.clues,
                            no: data.no
                        });
                    }
                }
                keys = $.map(cword, function(element, index) {
                    return index
                });
                clue = cword[keys[clueId]];
                elCl.html(printClue());
                setMask();
                $('#special-instructions').text(data.special && data.special !== "" ? data.special : "None");
                $('#author').text(data.author);
                $('#number').text(data.no);
            });
        }
    };

    /* test-code */
    obj._joinMask = joinMask;
    obj._getMask = getMask;
    obj._getMask2 = getMask2;
    /* end-test-code */

    return obj;

}();