# Hyperledger Sawtooth Framework Installation

### Install dependencies

* Ubuntu 16.04
* Docker CE https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/
* Docker Compose https://docs.docker.com/compose/install/

### Installation notes

* follow Docker instructions to ensure you can run docker commands without `sudo`

### Run Hyperledger Sawtooth Framework

```
cd HyperLedgerSetup
script/compose.sh up -d
```

* Hyperledger Sawtooth framework is up and running. If you want to expose the ports add 4004 and 8080 to security group.

### Stop and flush all the data logged on sawtooth

```
cd HyperLedgerSetup
script/compose.sh down
```
