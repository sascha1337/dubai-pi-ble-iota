# dubai-pi-ble-iota
dev repo for dubai raspberry pi m2m server implementing iota, webservice and and bluetooth low energy emitter

- sudo mv /usr/bin/node /usr/bin/node_old
- curl -L https://git.io/n-install | bash
- . /home/pi/.bashrc
- n 8.11
- sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
- sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
