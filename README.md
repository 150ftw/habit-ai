# HABIT AI: Procrastination vs Productivity Simulator

A high-fidelity Reinforcement Learning (RL) simulation platform designed to visualize the impact of habits, mental states, and task management on long-term productivity.

## 🚀 Live Demo
The project can be deployed to [Vercel]([https://vercel.com](https://habit-ai-two.vercel.app]) or any static hosting provider.

## 🧠 Core Concept
HABIT AI simulates a human-like agent navigating a Monday-Friday work week. The agent's decisions are influenced by:
- **Energy (0–10)**: Affects the ability to sustain high-quality work.
- **Motivation (0–10)**: Drives the agent towards productive tasks.
- **Workload (0–50)**: The accumulation of pending tasks.

### Actions
- **Work**: Reduces workload but consumes energy.
- **Rest**: Restores energy and slightly improves motivation.
- **Scroll Social Media**: Provides immediate gratification (motivation) but consumes time and energy without reducing workload.

## 🛠️ Technology Stack
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism, Neon Brutalism)
- **Logic**: Vanilla JavaScript
- **Visualizations**: Chart.js
- **Icons**: Lucide Icons

## 📦 Deployment
This project is a static web application. To deploy it:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run the deployment command: `vercel`
3. Follow the prompts to link your account and deploy.

## 👥 Team
- **Gaurav Mehra** (1/23/SET/BCS/423)
- **Shivam Sharma** (1/23/SET/BCS/424)

---
Developed as a demonstration of RL-inspired heuristic modeling.
