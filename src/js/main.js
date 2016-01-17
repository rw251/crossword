/*global CWORD Hammer*/
/*TODO
- toggle numbers with clue answers if available
- pencil functionality IGNORE
- skip clues that are filled in
- anagram letters IGNORE
- clues with bold or italic in e.g.
						<li><label id="8-across-clue" for="8-across">
							<span class="clue-number">8</span>  
							<span>Crossword fan losing last cent in New York, not in </span><i>this</i><span> state?

</span> (8)</label></li> //26327
					
						<li><label id="9-across-clue" for="9-across">
							<span class="clue-number">9</span>  
							Hostile male's disregarded order (5)</label></li> //26327
- clues like this:
<li><label id="23-across-clue" for="23-across">
							<span class="clue-number">23</span>  
							<span>Public path said to be superior //26337

</span> (8)</label></li>
- crossword 26404 has first clue as "see x" - appears to break a bit..
*/

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

var elLoad, elCid;

var setup = function(){
    $('#maincontainer').show();
    $('#bdy').off('keyup');
    hammertime.off('press');
    $('#swiper').hide().delay(10000).fadeToggle(1500).delay(2000).fadeToggle(2000);

    $('#btn-previous').on('click', function(e) {
        CWORD.nxt();
    });
    $('#btn-next').on('click', function(e) {
        CWORD.nxt(true);
    });
    $('#btn-options').on('click', function(e) {
        $('#div-options').toggle();
    });
    elLoad.on('click', function(e) {
        var id = parseInt(elCid.val(),10);
        CWORD.loadCrossword(id);
    });
    $('#btn-random').on('click', function(e) {
        CWORD.loadCrossword();
    });
    $(document).keypress(function(e) {
        if (e.which == 13) {
            CWORD.nxt(true);
            e.preventDefault();
        }
    });
    elCid.keypress(function(e) {
        if (e.which == 13) {
            elLoad.click();
            e.preventDefault();
        }
    });
    var cwordNumber = parseInt(window.location.search.replace("?", ""), 10);
    if (isNaN(cwordNumber)) CWORD.load('today.json', $('#cl'), $('#word'));
    else CWORD.load('data/' + cwordNumber + '.json', $('#cl'), $('#word'));
};

var hammertime;

$(document).ready(function() {
    //Quick hack to remove url bar on mobile devices
    /mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function() {
        window.scrollTo(0, 1);
    }, 1000);

    elLoad = $('#btn-load');
    elCid = $('#cword-id');
    
    var hist="";
    console.log("loaded");
    
    $('#maincontainer').hide();
    $('#bdy').on('keyup', function(e){
        hist += e.which;
        console.log(hist);
        if(hist.substr(hist.length-8,8)==="32323232") {
            setup();
        }
    });
    
    //enable swiping
    hammertime = new Hammer.Manager(document.getElementById('bdy'));
    hammertime.add( new Hammer.Press({ event: 'press', time: 3000 }) );
    hammertime.add( new Hammer.Swipe({ event: 'swipeleft', direction: Hammer.DIRECTION_LEFT }) );
    hammertime.add( new Hammer.Swipe({ event: 'swiperight', direction: Hammer.DIRECTION_RIGHT }) );
    
    hammertime
        .on('press', function(ev) {
            setup();
        })
        .on('swipeleft', function(ev) {
            CWORD.nxt(true);
        })
        .on('swiperight', function(ev) {
            CWORD.nxt();
        });
        
    if(window.matchMedia('(display-mode: standalone)').matches){
        setup();
    }
});