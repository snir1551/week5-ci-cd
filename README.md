
# Week 5 – CI/CD Pipeline with GitHub Actions

### Backend (https://week5-ci-cd-jjqo.onrender.com)
### Frontend (https://frontend-smoky-iota-15.vercel.app)
### GitHub Actions (Runs backend and frontend tasks separately on every push/pull request.)


----------------------------------------


### 1. **Repository and README**
- **Requirement:** Create a GitHub repository named `week5-ci-cd` with a README.md.
- **Implementation:**  
  - This repository is named `week5-ci-cd` and contains this README file.

### 2. **Pipeline Planning (Flowchart)**

![image](https://github.com/user-attachments/assets/95c780ea-ce10-4f6f-89e6-ef64b7175e77)

### 3. **Frontend and Backend**
- **Requirement:** The project must include a simple frontend and backend.
- **Implementation:**  
  - `frontend/` contains a React app.  
  - `backend/` contains a Node.js Express app.

### 4. **GitHub Actions for Testing**
- **Requirement:** Set up GitHub Actions to run tests for both parts when pushing code.
- **Implementation:**  
  - In `.github/workflows/ci-cd.yml`, the `test` job runs backend tests on every push and pull request:
    ```yaml
    test:
      runs-on: ubuntu-latest
      strategy:
        matrix:
          node-version: [18, 20]
      steps:
        - name: Checkout Code
          uses: actions/checkout@v4
        - name: Setup Node.js ${matrix.node-version}
          uses: actions/setup-node@v4
          with:
            node-version: ${{matrix.node-version}}
        - name: Test Backend
          run: |
            cd backend
            npm install
            npm test 
    ```

### 5. **Job Matrix**
- **Requirement:** Use job matrix to test across multiple versions of Node.js.
- **Implementation:**  
  - The `matrix.node-version: [18, 20]` in both `test` and `build` jobs:
    ```yaml
    strategy:
      matrix:
        node-version: [18, 20]
    ```

### 6. **Artifact Upload**
- **Requirement:** Configure artifact upload at the end of the build process.
- **Implementation:**  
  - In the `build` job, artifacts are uploaded:
    ```yaml
    - name: Upload Backend Build Artifact
      uses: actions/upload-artifact@v4
      with:
        name: backend-build-${{ matrix.node-version }}
        path: backend/
    - name: Upload Frontend Build Artifact
      uses: actions/upload-artifact@v4
      with:
        name: frontend-build-${{ matrix.node-version }}
        path: frontend/build
    ```

### 7. **GitHub Secrets**
- **Requirement:** Use GitHub Secrets to handle sensitive values (e.g., deployment keys, tokens).
- **Implementation:**  
  - Secrets are used for deployment and notifications:
    ```yaml
    - name: Deploy Backend to Render
      run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
    - name: Deploy Frontend to Vercel
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      run: |
        cd frontend
        vercel --prod --token $VERCEL_TOKEN --yes
    - name: Notify Discord on Success
      env:
        DISCORD_WEBHOOK: ${{ secrets.DISCORDBOT }}
    ```

### 8. **Slack/Discord Notifications**
- **Requirement:** Add Slack or Discord notifications in case of pipeline failure or success.
- **Implementation:**  
  - The `notify` job sends a message to Discord on both success and failure:
    ```yaml
    - name: Notify Discord on Success
      if: needs.deploy.result == 'success'
      env:
        DISCORD_WEBHOOK: ${{ secrets.DISCORDBOT }}
      run: |
        # ...payload and curl command...
    - name: Notify Discord on Failure
      if: needs.deploy.result == 'failure'
      env:
        DISCORD_WEBHOOK: ${{ secrets.DISCORDBOT }}
      run: |
        # ...payload and curl command...
    ```
![image](https://github.com/user-attachments/assets/aa9f8ed7-93db-4568-9698-5181b38fcefb)


---

## Reflection

See [REFLECTION.md](./REFLECTION.md) for what we learned, challenges faced, and ideas for improvement.

---

