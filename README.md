# Jellyfin Upload Website

This repository provides a web interface to upload Movies, TV Shows, and Anime to a Jellyfin server. The website is built using Node.js, and the instructions below outline how to set it up on an Ubuntu system. The setup can also be modified to work with other operating systems or containers.

## Prerequisites

Before you begin, ensure that Jellyfin is installed on your server.

### Install Jellyfin

Run the following command to install Jellyfin on Ubuntu:

```bash
curl https://repo.jellyfin.org/install-debuntu.sh | sudo bash
```
## Installation
First, you need to install some required software on your system:
```bash
sudo apt update
sudo apt install git
sudo apt install nodejs
sudo apt install npm
```
### Clone the repository
Navigate to your home directory and clone the repository:
```bash
cd ~
git clone https://github.com/therealpenguinn/jfu
```
### Set up the web directory
Create a directory for the web files and copy your repository files into it:
```bash
mkdir web
cp -r jfu/* web/
cd web
```
### Install Node.js dependencies
Use npm to install the required dependencies:
```bash
npm install
```
### Give Jellyfin the permissions for read and write 
```bash
sudo chown -R jellyfin:jellyfin /home/tux/web/jellyfin
sudo chmod -R 775 /home/tux/web/jellyfin
sudo usermod -aG tux jellyfin
sudo chmod -R 770 /home/tux/web/jellyfin
sudo systemctl restart jellyfin
```
### Start the server
Launch the application:
```bash
npm start
```
## Accessing the Jellyfin Upload Website
### Jellyfin Web Interface:
Once Jellyfin is set up, you can access the Jellyfin server at http://<your-ip-address>:8096.

### Jellyfin Upload Website:
The upload interface will be available at http://<your-ip-address>:3000.

Make sure to replace <your-ip-address> with the actual IP address of the machine running the server. To find <your-ip-address> 
```bash
sudo apt install net-tools
ifconfig
```
# WSL Script
If the Jellyfin and Upload website is running on WSL then make a file on windows called wsl.bat and paste the following:
```bash
@echo off
rem Check if WSL is running
tasklist /FI "IMAGENAME eq wsl.exe" | find /I "wsl.exe" >nul
if %ERRORLEVEL%==0 (
    rem If WSL is running, shut it down
    wsl --shutdown
    echo WSL Has Been Shut Down. Press any key to close the window...
    pause >nul
    exit
)

rem Start WSL silently in the background
powershell -WindowStyle Hidden -Command "Start-Process 'wsl' -WindowStyle Hidden"

rem Retrieve the local IP address
for /f "delims=[] tokens=2" %%a in ('ping -4 -n 1 %ComputerName% ^| findstr "["') do set "IP=%%a"

rem Display the messages with the actual IP address
echo Jellyfin is running on %IP%:8096
echo Upload Site is running on %IP%:3000
echo Wait for the window to close and open Jellyfin on browser

rem Wait for 25 seconds
timeout /t 25 /nobreak >nul

rem Ask if the user wants to open the browser
set /p choice=Do you want to open the browser? (y/n): 

rem Check the user's choice
if /I "%choice%"=="y" (
    start "" "http://%IP%:8096"
    start "" "http://%IP%:3000"
)

rem Exit the batch script
exit

```
### NOTE MAKE SURE THAT THE DISTRO ON WHICH JELLYFIN IS INSTALLED IS THE DEFULT WSL DISTRO. RUN THE FOLLOWING TO FINDOUT
```bash
wsl --list
```
