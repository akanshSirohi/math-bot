# MathBot

A simple Ollama based math bot made for learning purposes.

## Project Overview

MathBot is a web-based scientific calculator that uses Ollama to process and solve advanced mathematical problems. The bot supports LaTeX input for mathematical expressions and returns detailed, step-by-step solutions.

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akanshSirohi/math-bot.git
   cd math-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Ollama:**
   - Download and install Ollama from [ollama.com](https://ollama.com).
   - Ensure Ollama is running on your machine.

4. **Configure Environment Variables:**
   Create a `.env` file at the root with the following content:
   ```env
   OLLAMA_BASE_MODEL=deepseek-r1:1.5b
   ```
   Adjust the base model if necessary.

5. **Run the Application:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` to interact with MathBot.

## Usage

- Use the input area to type your mathematical expressions in LaTeX format.
- Toggle between LaTeX input mode and plain text input using the provided button.
- MathBot will process your input with the underlying Ollama model and return the computed result.

## Learning Goals

- Demonstrates integration between a NodeJS React frontend and Ollama as a machine learning backend.
- Provides insights into handling real-time streaming responses in a web application.

## License

This project is for educational purposes.
