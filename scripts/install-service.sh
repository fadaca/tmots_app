#!/bin/bash
# Usage: sudo ./scripts/install-service.sh /home/pi/tmots_app [user]

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 /path/to/tmots_app [user]"
  exit 1
fi

APP_DIR="$1"
USER="${2:-pi}"
SERVICE_NAME="tmots.service"

if [ ! -f "$APP_DIR/$SERVICE_NAME" ]; then
  echo "Error: $APP_DIR/$SERVICE_NAME not found. Copy the service file into the app folder first." >&2
  exit 2
fi

sudo cp "$APP_DIR/$SERVICE_NAME" /etc/systemd/system/
sudo sed -i "s|WorkingDirectory=.*|WorkingDirectory=$APP_DIR|" /etc/systemd/system/$SERVICE_NAME
sudo sed -i "s|ExecStart=.*|ExecStart=/usr/bin/node $APP_DIR/server.js|" /etc/systemd/system/$SERVICE_NAME
sudo sed -i "s|User=.*|User=$USER|" /etc/systemd/system/$SERVICE_NAME

sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

echo "Service installed and started. Check status with: sudo systemctl status $SERVICE_NAME"
