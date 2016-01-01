<?php
include '../../cron/cword/get-cword.php';
try {
    $type="cryptic";
    if(isset($_GET['type'])) {
        if($_GET['type']=="prize") $type="prize";
    }
    $id=getLatest($type);
    echo "Call this page with ?id=xxx&type=prize/cryptic&debug=true<br><br>";
    echo "Type: $type<br>";
    echo "Latest $type crossword: $id<br>";
    echo "Last loaded:" . file_get_contents("../../public_html/cword/last") . "<br>";
    if(isset($_GET['id'])) {
        $id = $_GET['id'];
    }
    $debug=true;
    if(isset($_GET['debug'])) {
        $debug = ($_GET['debug'] == "true");
    }
    echo "Crossword number: $id<br>";
    echo "Debug: " . ($debug ? "true" : "false") . "<br>";
    $clues = getCrossword($type, $id, $debug);
    echo '<pre>';
    print_r($clues);
    echo '</pre>';
}
catch (Exception $e) {
    echo 'Caught exception: ' . $e->getMessage();
}
?>	