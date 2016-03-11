<?php
include '../../cron/cword/simple_html_dom.php';

function getMostRecentSuccess(){
    ///- Get most recent success
    return file_get_contents("../../public_html/cword/last");
}

function getLatest($type){
    //Get latest from site
    $f     = file_get_html('https://www.theguardian.com/crosswords');
    $today = 0;
    foreach ($f->find('a') as $link) {
        if (preg_match("/https:\/\/www\.theguardian\.com\/crosswords\/" . $type . "\/[0-9]*$/", $link->href)) {
            $today = (int) preg_replace("/https:\/\/www\.theguardian\.com\/crosswords\/" . $type . "\/([0-9]+)$/", "$1", $link->href);
            break;
        }
    }
    
    if($today > 0) return $today;
    
    //Try to get it another way
    $f     = file_get_html('https://www.theguardian.com/crosswords/series/' . $type);
    $today = 0;
    foreach ($f->find('a') as $link) {
        if (preg_match("/https:\/\/www\.theguardian\.com\/crosswords\/" . $type . "\/[0-9]*$/", $link->href)) {
            $today = (int) preg_replace("/https:\/\/www\.theguardian\.com\/crosswords\/" . $type . "\/([0-9]+)$/", "$1", $link->href);
            break;
        }
    }
    
    return $today;
}

function getCrosswordBeta($html, $type, $number, $debug){
    if($debug) { echo "HTML returned: <pre>" . $html->plaintext . "</pre><br>"; }
    $arr  = array();
    $jsondata = $html->find('.js-crossword',0)->{'data-crossword-data'};
    if($debug) { echo "JS found: $jsondata<br>"; }
    $jsondata = str_replace('â€”', '', $jsondata);
    $jsondata = utf8_encode($jsondata); 
    $jsondata = str_replace('&quot;', '"', $jsondata);
    $jsondata = str_replace('\\n', '', $jsondata);
    if($debug) { echo "<br>JS after replace: $jsondata<br>"; }
    $data = json_decode($jsondata, true);
    $intersections = array();
    
    foreach ($data['entries'] as $element) {
        for($i=0; $i< $element['length']; $i++){
            $myId = $element['direction'] == "across" ? ($element['position']['x']+$i) . ',' . $element['position']['y'] : $element['position']['x'] . ',' . ($element['position']['y'] + $i);
            if (!array_key_exists($myId, $intersections)) {
                $intersections[$myId] = array();
            }
            $newarr = array(
                'loc' => $element['id'],
                'pos' => $i
            );
            array_push($intersections[$myId], $newarr);
        }
        $arr[]     = $element;
    }
    
    $special = $data['instructions'];
    $author=$data['creator']['name'];
    
    $clues = array();
    foreach ($arr as $clue) {
        $pos = array();
        
        for($i=0;$i<$clue['length']; $i++){
            $pos[] = array(
                'ans' => $clue['solution'][$i]
            );
            $myId = $clue['direction'] == "across" ? ($clue['position']['x']+$i) . ',' . $clue['position']['y'] : $clue['position']['x'] . ',' . ($clue['position']['y'] + $i);
            if (count($intersections[$myId])>1) {
                $other='';
                for($j=0;$j<2;$j++){
                    if($intersections[$myId][$j]['loc']!=$clue['id']){
                        $other = $intersections[$myId][$j];
                    }
                }
                $pos[count($pos) - 1]['intersection'] = array(
                    'location' => $other['loc'],
                    'position' => ($other['pos']+1)
                );
            }
        }
        
        $clues[$clue["id"]] = array(
            'others' => $clue["group"],
            'clue' => preg_replace("/\([^\)]+\)/", "", $clue["clue"]),
            'length' => preg_replace("/.+\(([^\)]*[0-9][^\)]*)\)/", "$1", $clue["clue"]),
            'positions' => $pos
        );
    }
    
    $cword = array(
        'special' => $special,
        'author' => $author,
        'clues' => $clues,
        'no'=>$number
    );

    return $cword;
}

function getCrossword($type, $number, $debug){
    
    $url = 'https://www.theguardian.com/crosswords/' . $type . '/' . $number;
    if($debug) { echo "URL: $url<br>"; } 
    $html = file_get_html($url);
    $kk = 0;
    
    while(count($html->find('.js-crossword')) <= 0 && $kk < 10) {
        $html = file_get_html($url);
        $kk++;
    }
    
    if($debug) { echo "k: $kk<br>"; }
    
    if($kk<10)  return getCrosswordBeta($html, $type, $number, $debug);
    else {
        ///try other type
        $type = ($type=="cryptic" ? "prize" : "cryptic");
        $url = 'https://www.theguardian.com/crosswords/' . $type . '/' . $number;
        if($debug) { echo "URL: $url<br>"; } 
        $html = file_get_html($url);
        $kk = 0;
        
        while(count($html->find('.js-crossword')) <= 0 && $kk < 10) {
            $html = file_get_html($url);
            $kk++;
        }
        if($debug) { echo "k: $kk<br>"; }
    
        if($kk<10)  return getCrosswordBeta($html, $type, $number, $debug);
    }
    
    
    if($debug) { echo "HTML returned: <pre>" . $html->plaintext . "</pre><br>"; }
    $arr  = array();
    
    if($debug) { echo "Looking for: .clues-col ol li label<br>"; } 
    foreach ($html->find('.clues-col ol li label') as $element) {
        $something = array(
            'location' => $element->for,
            'clue' => trim(preg_replace("/.*\/span>(.*)\([^\)]+\)/", "$1", preg_replace("/[\\n\\t]/", "", $element->innertext))),
            'length' => trim(preg_replace("/.*\/span>.*\(([^\)]+)\)/", "$1", preg_replace("/[\\n\\t]/", "", $element->innertext)))
        );
        $arr[]     = $something;
    }
    if($debug) { echo "Found: <pre>$arr</pre><br>"; } 
    $special = '';
    foreach ($html->find('#content p') as $element) {
        if(stristr($element->innertext, 'special instructions')!=FALSE) {
            $special = str_replace("</b>","",stristr($element->innertext, 'special instructions'));
        }
    }
    $author='';
    foreach ($html->find('meta') as $element) {
        if(strtolower($element->name)==='author') {
            $author = $element->content;
        }
    }
    if($author==''){
        foreach ($html->find('li.byline a') as $element) {
            $author = $element->innertext;
        }
    }
    
    
    foreach ($html->find('div.crossword script') as $element) {
        $text = trim(preg_replace("/[\\n\\t]/", "", $element->innertext));
    }
    
    $arra = explode(";", $text);
    
    $intersections = array();
    $solutions     = array();
    $words         = array();
    
    foreach ($arra as $value) {
        if (preg_match("/.*intersections\[.*/", $value)) {
            $x    = explode(",", preg_replace("/intersections\[\"([^\"]*)\-([0-9]*)\"\][^=]*=[^\"]*\"([^\"]*)\-([0-9]*)\"/", "$1,$2,$3,$4", $value));
            $x[0] = trim($x[0]);
            if (!array_key_exists($x[0], $intersections)) {
                $intersections[$x[0]] = array();
            }
            if (!array_key_exists($x[1], $intersections[$x[0]])) {
                $intersections[$x[0]][$x[1]] = array();
            }
            $intersections[$x[0]][$x[1]]['c2']    = $x[2];
            $intersections[$x[0]][$x[1]]['c2pos'] = $x[3];
        } else if (preg_match("/solutions\[/", $value) == 1) {
            $x    = explode(",", preg_replace("/solutions\[\"([^\"]*)\-([0-9]*)\"\][^=]*=[^\"]*\"([^\"]*)\"/", "$1,$2,$3", $value));
            $x[0] = trim($x[0]);
            if (!array_key_exists($x[0], $solutions)) {
                $solutions[$x[0]] = array();
            }
            $solutions[$x[0]][$x[1]] = array(
                'p' => $x[1],
                'a' => $x[2]
            );
        } else if (preg_match("/words_for_clue\[/", $value) == 1) {
            $x                  = explode("Â¬", preg_replace("/words_for_clue\[\"([^\"]*)\"\][^=]*=[^\[]*(\[[^\]]*\])/", "$1Â¬$2", $value));
            $words[trim($x[0])] = explode(",", preg_replace("/[\"'\[\]]/", "", $x[1]));
        }
    }
    
    $clues = array();
    foreach ($arr as $clue) {
        $pos = array();
        
        ksort($solutions[$clue["location"]]);
        foreach ($solutions[$clue["location"]] as $v) {
            $pos[] = array(
                'ans' => $v['a']
            );
            if (array_key_exists($v['p'], $intersections[$clue["location"]])) {
                $pos[count($pos) - 1]['intersection'] = array(
                    'location' => $intersections[$clue["location"]][$v['p']]['c2'],
                    'position' => (int) $intersections[$clue["location"]][$v['p']]['c2pos']
                );
            }
        }
        
        $clues[$clue["location"]] = array(
            'others' => $words[$clue["location"]],
            'clue' => $clue["clue"],
            'length' => $clue["length"],
            'positions' => $pos
        );
    }
    
    $cword = array(
        'special' => $special,
        'author' => $author,
        'clues' => $clues,
        'no'=>$number
    );
    
    return $cword;
}
?>	