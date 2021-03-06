<?php
///- Get the directory name that the file is located in
$mmm = dirname(__FILE__);

///- Change to the file's directory
chdir(dirname(__FILE__));
include '../../cron/cword/get-cword.php';
include '../../cron/cword/email.php';

$email='1234richardwilliams@gmail.com';

try {
    ///- Set the flag to either cryptic (mon-fri) or prize (sat)
    $type = "cryptic";
    if (date("N") == 6) {
        $type = "prize";
    }
    
    ///- Only do this if it's not a Sunday
    if (date("N") != 7) {
        ///- Get most recent success
        $last = file_get_contents("../../public_html/cword/last");
        
        //Get latest from site
        $id=getLatest($type);

        if ($id == 0) {
            //ERROR
            //email that couldn't identify the crossword
            mg_send($email, 'Cron Job Running', 'Cant identify todays crossword - last one is: ' . $last);
            return;
        } else if ($last > $id) {
            //ERROR
            //email last > today
            mg_send($email, 'Cron Job Running', 'LAST: ' . $last . ' is greater than TODAY:' . $id);
            return;
        } else if ($last == $id) {
            return;
        }
        
        echo $last . "</br>";
        echo $id . "</br>";
        
        
        for ($i = $last + 1; $i <= $id; $i++) {
            $output = getCrossword($type, $i, false);
            
            ///- If fewer than 10 clues then something is amiss
            if(sizeof($output['clues']) < 10){
                mg_send($email, 'Cron Job Running', 'Crossword has ' . sizeof($output['clues']). ' clues - something is wrong');
                return;
            } else {
            
                //Save file
                file_put_contents('../../public_html/cword/data/' . $i . '.json', json_encode($output));
                
                if ($i == $id) {
                    file_put_contents('../../public_html/cword/today.json', json_encode($output));
                    chmod('../../public_html/cword/today.json', 0755);
                }
                
                //update last
                file_put_contents('../../public_html/cword/last', $i);
                echo $i . "</br>";
                chmod('../../public_html/cword/data/' . $i . '.json', 0755);
            }
        }
        mg_send($email, 'Cron Job Running', 'Done: from: ' . $last . ' up to:' . $id);
    }
}
catch (Exception $e) {
    mg_send($email, 'Cron Job Running', 'Caught exception: ' . $e->getMessage());
}
?>	