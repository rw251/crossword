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
            if (mask[i] === 'a') parts.push(i);
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
            a.push(Array(parseInt(els[i]) + 1).join("a "));
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
        return joinMask(a.join("/ "));
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
                    no: parseInt($('#number').text(),10)
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