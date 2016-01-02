<?php

include dirname(__FILE__) . '/config.php';

function mg_send($to, $subject, $message) {

  $ch = curl_init();

  curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
  curl_setopt($ch, CURLOPT_USERPWD, 'api:'.MAILGUN_API);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

  $plain = strip_tags($message);

  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
  curl_setopt($ch, CURLOPT_URL, 'https://api.mailgun.net/v3/mg.'.DOMAIN.'/messages');
  curl_setopt($ch, CURLOPT_POSTFIELDS, array('from' => 'support@'.DOMAIN,
        'to' => $to,
        'subject' => $subject,
        'html' => $message,
        'text' => $plain));

  $j = json_decode(curl_exec($ch));

  $info = curl_getinfo($ch);

  if($info['http_code'] != 200) {
        echo "Oh dear an error... support@";
        print_r($j);
  }

  curl_close($ch);
  return $j;
}

?>