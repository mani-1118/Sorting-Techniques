# SortVision Pro

A professional-grade sorting algorithm visualizer with step-by-step history, speed control, and real-time complexity analysis.



## Features

- **Multiple Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, and Binary Search.
- **Step-by-Step Visualization**: Watch every comparison and swap in real-time.
- **Complexity Analysis**: Real-time tracking of comparisons and swaps.
- **Custom Arrays**: Input your own data to see how algorithms handle specific cases.
- **Code Execution**: See the algorithm's pseudocode run alongside the animation.
- **Speed Control**: Adjust the visualization speed to suit your learning pace.

## Deployment

This project is configured for easy deployment to **GitHub Pages**. 

To get your own live deployment link:
1. Push this code to a new GitHub repository.
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment > Source**, ensure it's set to **GitHub Actions**.
4. The included workflow in `.github/workflows/deploy.yml` will automatically build and deploy your app every time you push to the `main` branch.
5. Once the first action completes, you will see a "Deployments" section on your repository homepage (in the right sidebar) with a link to your live site.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## License

MIT
