#!/bin/bash

# AI 프로젝트 설치 스크립트

echo "Installing Python packages..."
pip install -r requirements.txt

echo "Installing nunchaku..."
nunchaku-installer install

echo "Uninstalling old numpy and cleaning cache..."
pip uninstall numpy -y
pip cache purge

echo "Installing specific numpy version..."
pip install numpy==2.0.0

echo "Setup complete!"