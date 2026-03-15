# Project Name: AI Calorie Tracker (Web Application)

## 1. Project Overview
A web-based AI Calorie Tracker designed to seamlessly log food intake via text, audio, and images. It tracks daily calories, macronutrients (carbs, protein, fat), micronutrients, and water intake. 

## 2. Design System & UI/UX Guidelines
* **Aesthetic:** High-end, Awwwards-style modern web design. 
* **Design Ideology:** Apple Human Interface Guidelines (glassmorphism, soft shadows, rounded corners, fluid animations) combined with Google Material Design's clean typography and spacing.
* **Interactivity:** Smooth hover effects on buttons and cards. A sticky/fixed top dashboard that continuously displays the remaining daily calories and macros.
* **Color Palette:** Dark mode by default with vibrant, glowing accents (e.g., neon green for goals met, soft red for overages) similar to Planetono/FitBite aesthetics.

## 3. Core Features
* **User Profile:** Adjustable height, weight, and daily calorie/water goals.
* **Top Dashboard:** Always-visible tracker for Calories (Eaten vs. Remaining) and Macros.
* **Multimodal Input System:**
    * *Text Input:* Manual typing of food items.
    * *Voice Input:* Audio-to-text transcription for hands-free logging.
    * *Image Input:* Uploading a photo of a meal to estimate calories.
* **Water Tracker:** Quick-add buttons (+1 cup, -1 cup).

## 4. AI & Datasets (Backend Logic)
* **Food & Recipe Dataset:** Kaggle's Epicurious Recipes (`hugodarwood/epirecipes`) and Food.com datasets to map text inputs to calorie/macro values.
* **Image Recognition:** Train/utilize a model on the Kaggle `Food-101` dataset to classify food images and fetch associated nutritional data.

## 5. Development Phases (Strictly execute one phase at a time)

**Phase 1: UI/UX Skeleton & Frontend Setup**
* Build the core HTML/CSS/JS (or React/Next.js) structure.
* Implement the Apple/Google design system (glassmorphism, hover effects).
* Create the static UI for the top dashboard, input fields, and water tracker.

**Phase 2: State Management & Basic Logic**
* Make the UI functional with dummy data. 
* Allow the user to change their height, weight, and goals, and have the dashboard update math accordingly.
* Make the water tracker buttons functional.

**Phase 3: Text & Audio Input Integration**
* Implement a search function using the recipe dataset.
* Integrate Web Speech API for the audio-to-text feature.

**Phase 4: AI Image Recognition Integration**
* Set up the image upload UI.
* Integrate the AI model (Food-101 based) to predict food items from uploaded images and automatically log them.