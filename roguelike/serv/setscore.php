<?php
require_once('FileAdapter.php');

$p = $_POST['p']; // player (name / mail)
$s = $_POST['s']; // score

//$score = $_SERVER['score'];
$score = array();
$score[] = array($p => $s);

$FA = new FileAdapter();
if($FA->saveCSV($score)) {
	echo json_encode(array('status' => true));
} else {
	echo json_encode(array('status' => false));
}