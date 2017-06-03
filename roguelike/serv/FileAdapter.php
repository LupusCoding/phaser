<?php

class FileAdapter
{
    const FMODE_READ    = 'rb';
    const FMODE_WRITE   = 'a';
	const FMODE_XWRITE  = 'x';

    const FECODE_EXIST  = 101;
    const FECODE_NEXIST = 102;
    const FECODE_OPEN   = 103;
    const FECODE_READ   = 104;
    const FECODE_WRITE  = 105;
    const FECODE_CLOSE  = 106;
    const FECODE_NOBUFF = 505;

    const FEMSG_EXIST   = 'The file %s already exists.';
    const FEMSG_NEXIST  = 'The file %s does not exist.';
    const FEMSG_OPEN    = 'Could not open / create file %s.';
    const FEMSG_READ    = 'Could not read from File %s.';
    const FEMSG_WRITE   = 'Could not write to File %s.';
    const FEMSG_CLOSE   = 'Could not close buffer for file %s.';
    const FEMSG_NOBUFF  = 'Empty or wrong buffer given.';
	
    //private $filename = 'score.csv';
    private $filename = '../res/score/score.csv';
	private $buffer = null;

	public function __construct()
	{}
	
    private function openFile($mode = null)
    {
		if($mode === null) {
			$mode = self::FMODE_READ;
		}
		//echo "DEBUG: MODE:     ".$mode."\r\n";
		//echo "DEBUG: FILENAME: ".var_export($this->filename,true)."\r\n";
		//echo "DEBUG: BUFFER:   ".var_export($this->buffer,true)."\r\n";
        if($mode == self::FMODE_READ) {
            if(!file_exists($this->filename)) {
                return self::FECODE_NEXIST;
            }
        }
		if($mode == self::FMODE_WRITE && !file_exists($this->filename)) {
			$mode = self::FMODE_XWRITE;
		}

        $this->buffer = fopen($this->filename, $mode);	
        if(!$this->buffer) {
            return self::FECODE_OPEN;
        }
        return true;
    }

    private function readFile()
    {
        if(!$this->buffer) {
            return self::FECODE_NOBUFF;
        }
        if(!($data = stream_get_contents($this->buffer))) {
            return self::FECODE_READ;
        }
        return $data;
    }

    private function writeFile($string)
    {
        if(!$this->buffer) {
            return self::FECODE_NOBUFF;
        }
        if(!fwrite($this->buffer, $string)) {
            return self::FEMSG_WRITE;
        }
        return true;
    }

    public function loadCsv()
    {
        $endOfLine = chr(13) . chr(10);

        $this->openFile();
        if(is_int($this->buffer)) {
            return $this->error($this->buffer);
        }
        $data = $this->readFile();
        if(is_int($data)) {
            fclose($this->buffer);
            return $this->error($data);
        }
        fclose($this->buffer);

		if(empty($data) || count($data) > 1) {
			return array();
		}
        $map = array();
        foreach(explode($endOfLine,$data) as $frow) {
            $player = null;
			$score = null;
			//echo "DEBUG: frow: ".$frow."\r\n";
			
			if(!preg_match('/\;/',$frow)) {
				continue;
			}
            $fcol = explode(';',$frow);
			$player = preg_replace('/\"/', '', $fcol[0]);
			$score = (int)preg_replace('/\"/', '', $fcol[1]);

            $map[] = array($player => $score);
        }

        return $map;
    }

    public function saveCSV($list)
    {
        // silence error handling
        //set_error_handler(function () {});

        $endOfLine = chr(13) . chr(10);

        $this->openFile(self::FMODE_WRITE);
        
        $csvString = '';
        foreach ($list as $row) {
			foreach ($row as $player => $score) {
				$csvString .= '"' . $player . '";"' . $score . '";' . $endOfLine;
			}
        }
        //$csvString = preg_replace('/'.$endOfLine.'$/', '', $csvString);

        $res = $this->writeFile($csvString);
        fclose($this->buffer);
        //restore_error_handler();
        if(is_int($res)) {
            return false;
        }

        return true;
    }
	
    public function error($code)
    {
        if(is_string($code)) {
            return $code;
        } else if(is_array($code)) {
            switch ($code[0]) {
                case 1:
                    $this->error('INFO: '.$code[1]);
                    break;
                case 2:
                    $this->error('SUCCESS: '.$code[1]);
                    break;
                case 3:
                    $this->error('FORBIDDEN: '.$code[1]);
                    break;
                case 4:
                    $this->error('CLIENT_ERROR: '.$code[1]);
                    break;
                case 5:
                    $this->error('SERVER_ERROR: '.$code[1]);
                    break;
            }
        } else {
            switch($code) {
                case self::FECODE_NEXIST:
                    $err = array(500,self::FEMSG_NEXIST);
                    break;
                case self::FECODE_EXIST:
                    $err = array(500,self::FEMSG_EXIST);
                    break;
                case self::FECODE_OPEN:
                    $err = array(500,self::FEMSG_OPEN);
                    break;
                case self::FECODE_READ:
                    $err = array(500,self::FEMSG_READ);
                    break;
                case self::FECODE_WRITE:
                    $err = array(500,self::FEMSG_WRITE);
                    break;
                case self::FECODE_CLOSE:
                    $err = array(500,self::FEMSG_CLOSE);
                    break;
                case self::FECODE_NOBUFF:
                    $err = array(500,self::FEMSG_NOBUFF);
                    break;
            }
            $this->error($err);
        }
    }

}