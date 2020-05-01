# Cryptojacking Attack Detection System #

This is a cryptojacking attack detection system that notifies when cryptojacking has been detected at runtime within a cloud server by via performance based classification

### Install Back-End Requirements
Using virtualenv recommended = no system-wide packages
```sh
$ mkdir venv && virtualenv -p python3 venv/demo
$ . venv/demo/bin/activate
$ pip install -r requirements.txt
```

### Install Front-End Requirements
```sh
$ cd static
$ npm install
```

### Run Back-End

```sh
$ python manage.py runserver
```
