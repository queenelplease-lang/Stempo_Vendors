#!/bin/bash

# Завантажуємо nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Використовуємо Node.js 22
nvm use 22

# Запускаємо dev сервер
npm run dev
