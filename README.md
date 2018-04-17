# MedMan
CLI Media Manager for keeping files organised

## Installation

* Clone or download repo to your local machine
* cd into 'medman' directory
* ```$ npm install -g```

## Usage

* cd into folder containing a season of a tv series to rename
* e.g:
  ```
  Silicon.Valley.XAVCD.WEBDL.S01E01.720P.Yify.mp4
  Silicon.Valley.XAVCD.WEBDL.S01E02.720P.Yify.mp4
  Silicon.Valley.XAVCD.WEBDL.S01E03.720P.Yify.mp4
  Silicon.Valley.XAVCD.WEBDL.S01E04.720P.Yify.mp4
  Silicon.Valley.XAVCD.WEBDL.S01E05.720P.Yify.mp4
  Silicon.Valley.XAVCD.WEBDL.S01E06.720P.Yify.mp4
  ```
* Invoke medman's ```season``` function, and pass in the series name
* ```$ medman season 'Silicon Valley'```
* medman will grab the episode identifier of each file and rename to ```Silicon Valley - S01E01.mp4``` for example
* This matches the format required by Plex media server
