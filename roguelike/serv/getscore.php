<?php

require_once('FileAdapter.php');

$FA = new FileAdapter();
$score = $FA->loadCSV();
//$_SERVER['score'] = $score;
//$jscore = array('player' => 'player', 'score' => 0);

for($j=0; $j < count($score); $j++) {
	for($i=count($score)-1;$i>0;$i--) {
		if($score[$i][array_keys($score[$i])[0]] > $score[$i-1][array_keys($score[$i-1])[0]]) {
			$tmp = $score[$i-1];
			$score[$i-1] = $score[$i];
			$score[$i] = $tmp;
		}
	}
}

$jscore = array();
if(!empty($score) && count($score) > 0) {
	foreach($score as $srow) {
		foreach ($srow as $player => $score) {
			$jscore[] = array('player' => $player, 'score' => (int)$score);
		}
	}
} else {
	$jscore[] = array('player' => '', 'score' => 0);
}
echo json_encode($jscore);

